import {
  reflector,
  TypeProvider,
  Provider,
  Type,
  resolveForwardRef,
  Injectable,
  ResolvedReflectiveProvider,
  ReflectiveInjector
} from '@ts-stack/di';

import {
  ModuleMetadata,
  defaultProvidersPerReq,
  ModuleType,
  ModuleWithOptions,
  ProvidersMetadata
} from './decorators/module';
import { RouteDecoratorMetadata } from './decorators/route';
import { BodyParserConfig } from './types/types';
import { flatten, normalizeProviders, NormalizedProvider } from './utils/ng-utils';
import { isRootModule, isController, isRoute, isImportsWithPrefix } from './utils/type-guards';
import { mergeArrays } from './utils/merge-arrays-options';
import { Router, RouteConfig, ImportsWithPrefix, ImportsWithPrefixDecorator } from './types/router';
import { NodeReqToken, NodeResToken } from './types/injection-tokens';
import { Logger } from './types/logger';
import { Factory } from './factory';
import { getDuplicates } from './utils/get-duplicates';
import { deepFreeze } from './utils/deep-freeze';
import { pickProperties } from './utils/pick-properties';

/**
 * - creates `injectorPerMod` and `injectorPerReq`;
 * - settings routes.
 */
@Injectable()
export class ModuleFactory extends Factory {
  protected mod: Type<any>;
  protected moduleName: string;
  protected prefixPerApp: string;
  protected prefixPerMod: string;
  protected resolvedProvidersPerReq: ResolvedReflectiveProvider[];
  protected opts: ModuleMetadata;
  protected exportedProvidersPerMod: Provider[] = [];
  protected exportedProvidersPerReq: Provider[] = [];
  protected globalProviders: ProvidersMetadata;
  /**
   * Injector per the module.
   */
  protected injectorPerMod: ReflectiveInjector;
  /**
   * Only for testing purpose.
   */
  protected optsMap = new Map<Type<any>, ModuleMetadata>();
  protected injectorPerReqMap = new Map<Type<any>, ReflectiveInjector>();

  constructor(protected router: Router, protected injectorPerApp: ReflectiveInjector, protected log: Logger) {
    super();
  }

  /**
   * Called only by `@RootModule` before called `ModuleFactory#boostrap()`.
   */
  importGlobalProviders(rootModule: Type<any>, globalProviders: ProvidersMetadata) {
    this.moduleName = this.getModuleName(rootModule);
    const moduleMetadata = this.mergeMetadata(rootModule);
    this.opts = new ModuleMetadata();
    pickProperties(this.opts, moduleMetadata);
    this.globalProviders = globalProviders;
    this.importProviders(rootModule);
    this.checkProvidersUnpredictable();

    return {
      providersPerMod: this.exportedProvidersPerMod,
      providersPerReq: this.exportedProvidersPerReq
    };
  }

  /**
   * Bootstraps a module.
   *
   * @param modOrObject Module that will bootstrapped.
   */
  bootstrap(
    globalProviders: ProvidersMetadata,
    prefixPerApp: string,
    prefixPerMod: string,
    modOrObject: Type<any> | ModuleWithOptions<any>
  ) {
    this.globalProviders = globalProviders;
    this.prefixPerApp = prefixPerApp || '';
    this.prefixPerMod = prefixPerMod || '';
    const mod = this.getModule(modOrObject);
    this.mod = mod;
    this.moduleName = mod.name;
    const moduleMetadata = this.mergeMetadata(modOrObject);
    this.quickCheckMetadata(moduleMetadata);
    this.opts = new ModuleMetadata();
    Object.assign(this.opts, moduleMetadata);
    this.importModules();
    this.mergeProviders(moduleMetadata);
    this.injectorPerMod = this.injectorPerApp.resolveAndCreateChild(this.opts.providersPerMod);
    this.injectorPerMod.resolveAndInstantiate(mod);
    this.initProvidersPerReq();
    this.checkRoutePath(this.prefixPerApp);
    this.checkRoutePath(this.prefixPerMod);
    const prefix = [this.prefixPerApp, this.prefixPerMod].filter(s => s).join('/');
    this.opts.controllers.forEach(Ctrl => this.setRoutes(prefix, Ctrl));
    this.loadRoutesConfig(prefix, this.opts.routes);
    return { optsMap: this.optsMap.set(mod, this.opts), injectorPerReqMap: this.injectorPerReqMap };
  }

  protected mergeProviders(moduleMetadata: ModuleMetadata) {
    const duplicatesProvidersPerMod = getDuplicates([
      ...this.globalProviders.providersPerMod,
      ...this.opts.providersPerMod
    ]);
    const globalProvidersPerMod = isRootModule(moduleMetadata) ? [] : this.globalProviders.providersPerMod;
    this.opts.providersPerMod = [
      ...globalProvidersPerMod.filter(p => !duplicatesProvidersPerMod.includes(p)),
      ...this.exportedProvidersPerMod,
      ...this.opts.providersPerMod
    ];

    const duplicatesProvidersPerReq = getDuplicates([
      ...this.globalProviders.providersPerReq,
      ...this.opts.providersPerReq
    ]);
    const globalProvidersPerReq = isRootModule(moduleMetadata)
      ? defaultProvidersPerReq
      : this.globalProviders.providersPerReq;
    this.opts.providersPerReq = [
      ...globalProvidersPerReq.filter(p => !duplicatesProvidersPerReq.includes(p)),
      ...this.exportedProvidersPerReq,
      ...this.opts.providersPerReq
    ];
  }

  protected loadRoutesConfig(prefix: string, configs: RouteConfig[]) {
    for (const config of configs) {
      const childPrefix = [prefix, config.path].filter(s => s).join('/');
      if (config.controller) {
        this.setRoutes(childPrefix, config.controller, config.routeData);
      }
      this.loadRoutesConfig(childPrefix, config.children || []);
    }
  }

  protected quickCheckMetadata(moduleMetadata: ModuleMetadata) {
    if (
      !isRootModule(moduleMetadata as any) &&
      !moduleMetadata.providersPerApp.length &&
      !moduleMetadata.controllers.length &&
      !someController(moduleMetadata.routes) &&
      !moduleMetadata.exports.length
    ) {
      throw new Error(
        `Import ${this.moduleName} failed: this module should have "providersPerApp" or some controllers or "exports" array with elements.`
      );
    }

    function someController(configs: RouteConfig[]) {
      for (const config of configs || []) {
        if (config.controller || someController(config.children)) {
          return true;
        }
      }
    }
  }

  protected mergeMetadata(mod: Type<any> | ModuleWithOptions<any>) {
    const modMetadata = this.getRawModuleMetadata(mod);
    const modName = this.getModuleName(mod);
    this.checkModuleMetadata(modMetadata, modName);

    /**
     * Setting initial properties of metadata.
     */
    const metadata = new ModuleMetadata();
    /**
     * `ngMetadataName` is used only internally and is hidden from the public API.
     */
    (metadata as any).ngMetadataName = (modMetadata as any).ngMetadataName;

    type FlattenedImports = Type<any> | ModuleWithOptions<any> | ImportsWithPrefixDecorator;
    metadata.imports = flatten<FlattenedImports>(modMetadata.imports).map<ImportsWithPrefix>(imp => {
      if (isImportsWithPrefix(imp)) {
        return {
          prefix: imp.prefix,
          module: resolveForwardRef(imp.module)
        };
      }
      return {
        prefix: '',
        module: resolveForwardRef(imp)
      };
    });
    metadata.exports = flatten(modMetadata.exports).map(resolveForwardRef);
    metadata.providersPerApp = flatten(modMetadata.providersPerApp);
    metadata.providersPerMod = flatten(modMetadata.providersPerMod);
    metadata.providersPerReq = flatten(modMetadata.providersPerReq);
    metadata.controllers = mergeArrays(metadata.controllers, modMetadata.controllers);
    metadata.routes = mergeArrays(metadata.routes, modMetadata.routes);

    return metadata;
  }

  /**
   * Init providers per the request.
   */
  protected initProvidersPerReq() {
    this.resolvedProvidersPerReq = ReflectiveInjector.resolve(this.opts.providersPerReq);
    const injectorPerReq = this.injectorPerMod.createChildFromResolved(this.resolvedProvidersPerReq);
    this.injectorPerReqMap.set(this.mod, injectorPerReq);
  }

  /**
   * Inserts new `Provider` at the start of `providersPerReq` array.
   */
  protected unshiftProvidersPerReq(...providers: Provider[]) {
    this.opts.providersPerReq.unshift(...providers);
    this.initProvidersPerReq();
  }

  protected importModules() {
    for (const imp of this.opts.imports) {
      this.importProviders(imp.module);
      const prefixPerMod = [this.prefixPerMod, imp.prefix].filter(s => s).join('/');
      const mod = imp.module;
      const moduleFactory = this.injectorPerApp.resolveAndInstantiate(ModuleFactory) as ModuleFactory;
      const { optsMap } = moduleFactory.bootstrap(this.globalProviders, this.prefixPerApp, prefixPerMod, mod);
      this.optsMap = new Map([...this.optsMap, ...optsMap]);
    }
    this.checkProvidersUnpredictable();
  }

  /**
   * @param modOrObject Module from where exports providers.
   * @param soughtProvider Normalized provider.
   */
  protected importProviders(modOrObject: Type<any> | ModuleWithOptions<any>, soughtProvider?: NormalizedProvider) {
    const { exports: exp, imports, providersPerMod, providersPerReq } = this.mergeMetadata(modOrObject);
    const moduleName = this.getModuleName(modOrObject);

    for (const moduleOrProvider of exp) {
      const moduleMetadata = this.getRawModuleMetadata(moduleOrProvider as ModuleType);
      if (moduleMetadata) {
        const reexportedModuleOrObject = moduleOrProvider as ModuleType | ModuleWithOptions<any>;
        this.importProviders(reexportedModuleOrObject, soughtProvider);
      } else {
        const provider = moduleOrProvider as Provider;
        const normProvider = normalizeProviders([provider])[0];
        const providerName = normProvider.provide.name || normProvider.provide;
        if (soughtProvider && soughtProvider.provide !== normProvider.provide) {
          continue;
        }
        let foundProvider = this.findAndSetProvider(provider, normProvider, providersPerMod, providersPerReq);
        if (!foundProvider) {
          for (const imp of imports) {
            foundProvider = this.importProviders(imp.module, normProvider);
            if (foundProvider) {
              break;
            }
          }
        }

        if (!foundProvider) {
          throw new Error(
            `Exported ${providerName} from ${moduleName} ` +
              `should includes in "providersPerMod" or "providersPerReq", ` +
              `or in some "exports" of imported modules. ` +
              `Tip: "providersPerApp" no need exports, they are automatically exported.`
          );
        }

        if (soughtProvider) {
          return true;
        }
      }
    }
  }

  protected findAndSetProvider(
    provider: Provider,
    normProvider: NormalizedProvider,
    providersPerMod: Provider[],
    providersPerReq: Provider[]
  ) {
    if (hasProvider(providersPerMod)) {
      this.exportedProvidersPerMod.push(provider);
      return true;
    } else if (hasProvider(providersPerReq)) {
      this.exportedProvidersPerReq.push(provider);
      return true;
    }

    return false;

    function hasProvider(providers: Provider[]) {
      const normProviders = normalizeProviders(providers);
      return normProviders.some(p => p.provide === normProvider.provide);
    }
  }

  /**
   * @todo Make tests for `multi == true` providers.
   */
  protected checkProvidersUnpredictable() {
    const tokensPerApp = normalizeProviders(this.globalProviders.providersPerApp).map(np => np.provide);

    const declaredTokensPerMod = normalizeProviders(this.opts.providersPerMod).map(np => np.provide);
    const exportedNormalizedPerMod = normalizeProviders(this.exportedProvidersPerMod);
    const exportedTokensPerMod = exportedNormalizedPerMod.map(np => np.provide);
    const multiTokensPerMod = exportedNormalizedPerMod.filter(np => np.multi).map(np => np.provide);
    const duplExpPerMod = getDuplicates(exportedTokensPerMod).filter(
      d => !declaredTokensPerMod.includes(d) && !multiTokensPerMod.includes(d)
    );
    const tokensPerMod = [...declaredTokensPerMod, ...exportedTokensPerMod];

    const declaredTokensPerReq = normalizeProviders(this.opts.providersPerReq).map(np => np.provide);
    const exportedNormalizedPerReq = normalizeProviders(this.exportedProvidersPerReq);
    const exportedTokensPerReq = exportedNormalizedPerReq.map(np => np.provide);
    const multiTokensPerReq = exportedNormalizedPerReq.filter(np => np.multi).map(np => np.provide);
    const duplExpPerReq = getDuplicates(exportedTokensPerReq).filter(
      d => !declaredTokensPerReq.includes(d) && !multiTokensPerReq.includes(d)
    );

    const mixPerApp = tokensPerApp.filter(p => {
      if (exportedTokensPerMod.includes(p) && !declaredTokensPerMod.includes(p)) {
        return true;
      }
      return exportedTokensPerReq.includes(p) && !declaredTokensPerReq.includes(p);
    });

    const defaultTokens = normalizeProviders([...defaultProvidersPerReq]).map(np => np.provide);
    const mergedTokens = [...defaultTokens, ...tokensPerMod, NodeReqToken, NodeResToken];
    const mixPerModOrReq = mergedTokens.filter(p => {
      return exportedTokensPerReq.includes(p) && !declaredTokensPerReq.includes(p);
    });

    const unpredictables = [...duplExpPerMod, ...duplExpPerReq, ...mixPerApp, ...mixPerModOrReq];
    if (unpredictables.length) {
      this.throwErrorProvidersUnpredictable(this.moduleName, unpredictables);
    }
  }

  protected setRoutes(prefix: string, Ctrl: TypeProvider, routeData?: any) {
    const controllerMetadata = deepFreeze(reflector.annotations(Ctrl).find(isController));
    if (!controllerMetadata) {
      throw new Error(`Setting routes failed: class "${Ctrl.name}" does not have the "@Controller()" decorator`);
    }
    const providersPerReq = controllerMetadata.providersPerReq;
    const propMetadata = reflector.propMetadata(Ctrl) as RouteDecoratorMetadata;

    for (const prop in propMetadata) {
      const routes = propMetadata[prop].filter(isRoute);
      for (const route of routes) {
        this.checkRoutePath(route.path);
        this.unshiftProvidersPerReq(Ctrl);
        let resolvedProvidersPerReq: ResolvedReflectiveProvider[] = this.resolvedProvidersPerReq;
        if (providersPerReq) {
          resolvedProvidersPerReq = ReflectiveInjector.resolve([...this.opts.providersPerReq, ...providersPerReq]);
        }

        const injectorPerReq = this.injectorPerMod.createChildFromResolved(resolvedProvidersPerReq);
        this.injectorPerReqMap.set(this.mod, injectorPerReq);
        const bodyParserConfig = injectorPerReq.get(BodyParserConfig) as BodyParserConfig;
        const parseBody = bodyParserConfig.acceptMethods.includes(route.httpMethod);

        const path = [prefix, route.path].filter(s => s).join('/');
        this.router.on(route.httpMethod, `/${path}`, () => ({
          injector: this.injectorPerMod,
          providers: resolvedProvidersPerReq,
          controller: Ctrl,
          method: prop,
          parseBody,
          routeData
        }));

        this.log.trace({
          httpMethod: route.httpMethod,
          path,
          handler: `${Ctrl.name} -> ${prop}()`
        });
      }
    }
  }

  protected checkRoutePath(path: string) {
    if (path.charAt(0) == '/') {
      throw new Error(
        `Invalid configuration of route '${path}' (in '${this.moduleName}'): path cannot start with a slash`
      );
    }
  }
}
