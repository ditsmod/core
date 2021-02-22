import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';
import { ReflectiveInjector, reflector, Provider, Type, resolveForwardRef } from '@ts-stack/di';

import { RootModuleDecorator, defaultProvidersPerApp } from './decorators/root-module';
import { ExtensionMetadata } from './types/types';
import { isHttp2SecureServerOptions, isProvider, isRootModule } from './utils/type-guards';
import { PreRequest } from './services/pre-request';
import { ModuleFactory } from './module-factory';
import { pickProperties } from './utils/pick-properties';
import { Logger, LoggerConfig } from './types/logger';
import { Server, Http2SecureServerOptions } from './types/server-options';
import {
  ModuleType,
  ModuleWithOptions,
  ModuleDecorator,
  ProvidersMetadata,
  defaultProvidersPerReq,
} from './decorators/module';
import { getDuplicates } from './utils/get-duplicates';
import { flatten, normalizeProviders } from './utils/ng-utils';
import { Core } from './core';
import { DefaultLogger } from './services/default-logger';
import { PreRouting } from './pre-routing';
import { AppMetadata } from './decorators/app-metadata';

export class Application extends Core {
  protected log: Logger;
  protected server: Server;
  protected injectorPerApp: ReflectiveInjector;
  protected preReq: PreRequest;
  protected opts: AppMetadata;

  bootstrap(appModule: ModuleType) {
    return new Promise<{ server: Server; log: Logger }>((resolve, reject) => {
      try {
        const config = new LoggerConfig();
        this.log = new DefaultLogger(config);
        this.prepareModules(appModule);
        this.createServer();
        this.server.listen(this.opts.listenOptions, () => {
          resolve({ server: this.server, log: this.log });
          const host = this.opts.listenOptions.host || 'localhost';
          this.log.info(`${this.opts.serverName} is running at ${host}:${this.opts.listenOptions.port}`);
        });
      } catch (err) {
        reject({ err, log: this.log });
      }
    });
  }

  protected prepareModules(appModule: ModuleType) {
    this.mergeMetadata(appModule);
    this.checkSecureServerOption(appModule);
    this.prepareProvidersPerApp(appModule);
    this.opts.providersPerApp.unshift(...defaultProvidersPerApp);
    this.initProvidersPerApp();
    const extensionsMetadataMap = this.bootstrapModuleFactory(appModule);
    this.callExtensions(extensionsMetadataMap);
    return extensionsMetadataMap;
  }

  /**
   * Merge AppModule metadata with default AppMetadata.
   */
  protected mergeMetadata(appModule: ModuleType): void {
    const modMetadata = reflector.annotations(appModule).find(isRootModule);
    if (!modMetadata) {
      throw new Error(`Module build failed: module "${appModule.name}" does not have the "@RootModule()" decorator`);
    }

    // Setting default metadata.
    this.opts = new AppMetadata();

    pickProperties(this.opts, modMetadata);
  }

  protected checkSecureServerOption(appModule: ModuleType) {
    const serverOptions = this.opts.serverOptions as Http2SecureServerOptions;
    if (serverOptions?.isHttp2SecureServer && !(this.opts.httpModule as typeof http2).createSecureServer) {
      throw new TypeError(`serverModule.createSecureServer() not found (see ${appModule.name} settings)`);
    }
  }

  /**
   * 1. checks collisions for non-root exported providers per app;
   * 2. then merges these providers with providers that declared on root module.
   */
  protected prepareProvidersPerApp(appModule: ModuleType) {
    // Here we work only with providers declared at the application level.

    const exportedProviders = this.collectProvidersPerApp(appModule);
    const rootTokens = normalizeProviders(this.opts.providersPerApp).map((np) => np.provide);
    const exportedNormProviders = normalizeProviders(exportedProviders);
    const exportedTokens = exportedNormProviders.map((np) => np.provide);
    const exportedMultiTokens = exportedNormProviders.filter((np) => np.multi).map((np) => np.provide);
    const defaultTokens = normalizeProviders([...defaultProvidersPerApp]).map((np) => np.provide);
    const mergedTokens = [...exportedTokens, ...defaultTokens];
    let exportedTokensDuplicates = getDuplicates(mergedTokens).filter(
      (d) => !rootTokens.includes(d) && !exportedMultiTokens.includes(d)
    );
    const mergedProviders = [...defaultProvidersPerApp, ...exportedProviders];
    exportedTokensDuplicates = this.getTokensCollisions(exportedTokensDuplicates, mergedProviders);
    if (exportedTokensDuplicates.length) {
      this.throwProvidersCollisionError(appModule.name, exportedTokensDuplicates);
    }
    this.opts.providersPerApp.unshift(...exportedProviders);
  }

  /**
   * Recursively collects per app providers from non-root modules.
   */
  protected collectProvidersPerApp(modOrObject: Type<any> | ModuleWithOptions<any>) {
    const modName = this.getModuleName(modOrObject);
    const modMetadata = this.getRawModuleMetadata(modOrObject) as RootModuleDecorator | ModuleDecorator;
    this.checkModuleMetadata(modMetadata, modName);

    let modules = [modMetadata.imports, modMetadata.exports?.filter((exp) => !isProvider(exp))];
    modules = modules.filter((el) => el);
    const preparedModules = flatten(modules).map<Type<any> | ModuleWithOptions<any>>(resolveForwardRef);
    const providersPerApp: Provider[] = [];
    preparedModules.forEach((mod) => providersPerApp.push(...this.collectProvidersPerApp(mod)));
    const currProvidersPerApp = isRootModule(modMetadata) ? [] : flatten(modMetadata.providersPerApp);

    return [...providersPerApp, ...this.getUniqProviders(currProvidersPerApp)];
  }

  /**
   * Init providers per the application.
   */
  protected initProvidersPerApp() {
    this.opts.providersPerApp.push({ provide: AppMetadata, useValue: this.opts });
    this.injectorPerApp = ReflectiveInjector.resolveAndCreate(this.opts.providersPerApp);
    this.log = this.injectorPerApp.get(Logger) as Logger;
    this.preReq = this.injectorPerApp.get(PreRequest) as PreRequest;
  }

  protected bootstrapModuleFactory(appModule: ModuleType) {
    const globalProviders = this.getGlobalProviders(appModule);
    this.log.trace({ globalProviders });
    const rootModule = this.injectorPerApp.resolveAndInstantiate(ModuleFactory) as ModuleFactory;
    return rootModule.bootstrap(globalProviders, '', appModule);
  }

  protected getGlobalProviders(appModule: ModuleType) {
    const globalProviders = new ProvidersMetadata();
    globalProviders.providersPerApp = this.opts.providersPerApp;
    const rootModule = this.injectorPerApp.resolveAndInstantiate(ModuleFactory) as ModuleFactory;
    const { providersPerMod, providersPerReq } = rootModule.importGlobalProviders(appModule, globalProviders);
    globalProviders.providersPerMod = providersPerMod;
    globalProviders.providersPerReq = [...defaultProvidersPerReq, ...providersPerReq];
    return globalProviders;
  }

  /**
   * @todo Add test for prefixPerApp.
   */
  protected callExtensions(extensionsMetadataMap: Map<ModuleType, ExtensionMetadata>) {
    extensionsMetadataMap.forEach((extensionsMetadata, mod) => {
      this.log.trace(mod, extensionsMetadata);
      const { providersPerMod } = extensionsMetadata.moduleMetadata;
      const prefixPerMod = extensionsMetadata.prefixPerMod;
      const injectorPerMod = this.injectorPerApp.resolveAndCreateChild(providersPerMod);
      injectorPerMod.resolveAndInstantiate(mod); // Only check DI resolvable
      const preRouting = injectorPerMod.resolveAndInstantiate(PreRouting) as PreRouting;
      preRouting.setRoutes(mod.name, this.opts.prefixPerApp, prefixPerMod, extensionsMetadata.routesData);
    });
  }

  protected createServer() {
    if (isHttp2SecureServerOptions(this.opts.serverOptions)) {
      const serverModule = this.opts.httpModule as typeof http2;
      this.server = serverModule.createSecureServer(this.opts.serverOptions, this.preReq.requestListener);
    } else {
      const serverModule = this.opts.httpModule as typeof http | typeof https;
      const serverOptions = this.opts.serverOptions as http.ServerOptions | https.ServerOptions;
      this.server = serverModule.createServer(serverOptions, this.preReq.requestListener);
    }
  }
}
