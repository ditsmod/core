import { ListenOptions } from 'net';
import * as http from 'http';
import * as https from 'https';
import * as http2 from 'http2';
import { Provider, ReflectiveInjector } from 'ts-di';

import { BootstrapRootModule } from '../../src/modules/bootstrap-root.module';
import { ModuleType, Logger, HttpModule, ServerOptions, Server, Router } from '../../src/types/types';
import { RootModuleDecorator, RootModule } from '../../src/types/decorators';
import { PreRequest } from '../../src/services/pre-request.service';

describe('BootstrapRootModule', () => {
  class MockBootstrapRootModule extends BootstrapRootModule {
    log: Logger;
    serverName: string;
    httpModule: HttpModule;
    serverOptions: ServerOptions;
    server: Server;
    listenOptions: ListenOptions;
    providersPerApp: Provider[];
    injectorPerApp: ReflectiveInjector;
    router: Router;
    preReq: PreRequest;

    mergeMetadata(appModule: ModuleType): RootModuleDecorator {
      return super.mergeMetadata(appModule);
    }

    getAppModuleMetadata(appModule: ModuleType): RootModuleDecorator {
      return super.getAppModuleMetadata(appModule);
    }

    checkSecureServerOption(appModule: ModuleType) {
      return super.checkSecureServerOption(appModule);
    }
  }

  let mockBs: MockBootstrapRootModule;

  beforeEach(() => {
    mockBs = new MockBootstrapRootModule();
  });

  class SomeControllerClass {}
  @RootModule({ controllers: [SomeControllerClass] })
  class ClassWithDecorators {}

  class ClassWithoutDecorators {}

  describe('getAppModuleMetadata()', () => {
    it('should returns ClassWithDecorators metadata', () => {
      const metadata = mockBs.getAppModuleMetadata(ClassWithDecorators);
      expect(metadata).toEqual(new RootModule({ controllers: [SomeControllerClass] }));
    });

    it('should not returns any metadata', () => {
      const metadata = mockBs.getAppModuleMetadata(ClassWithoutDecorators);
      expect(metadata).toBeUndefined();
    });
  });

  describe('mergeMetadata()', () => {
    it('should merge default metatada with ClassWithDecorators metadata', () => {
      const metadata = mockBs.mergeMetadata(ClassWithDecorators);
      expect(metadata.serverName).toEqual('restify-ts');
      expect(metadata.serverOptions).toEqual({});
      expect(metadata.httpModule).toBeDefined();
      expect(metadata.providersPerApp && metadata.providersPerApp.length).toBe(5);
      expect(metadata.controllers).toEqual(undefined);
      expect(metadata.exports).toEqual(undefined);
      expect(metadata.imports).toEqual(undefined);
      expect(metadata.listenOptions).toBeDefined();
      expect(metadata.providersPerMod).toEqual(undefined);
      expect(metadata.providersPerReq).toEqual(undefined);
    });

    it('ClassWithoutDecorators should not have metatada', () => {
      const msg = `Module build failed: module "ClassWithoutDecorators" does not have the "@RootModule()" decorator`;
      expect(() => mockBs.mergeMetadata(ClassWithoutDecorators)).toThrowError(msg);
    });
  });

  describe('checkSecureServerOption()', () => {
    it('should not to throw with http2 and isHttp2SecureServer == true', () => {
      mockBs.serverOptions = { isHttp2SecureServer: true };
      mockBs.httpModule = http2;
      expect(() => mockBs.checkSecureServerOption(ClassWithDecorators)).not.toThrow();
    });

    it('should to throw with http and isHttp2SecureServer == true', () => {
      mockBs.serverOptions = { isHttp2SecureServer: true };
      mockBs.httpModule = http;
      const msg = 'serverModule.createSecureServer() not found (see ClassWithDecorators settings)';
      expect(() => mockBs.checkSecureServerOption(ClassWithDecorators)).toThrowError(msg);
    });

    it('should not to throw with http and isHttp2SecureServer == false', () => {
      mockBs.httpModule = http;
      const msg = 'serverModule.createSecureServer() not found (see ClassWithDecorators settings)';
      expect(() => mockBs.checkSecureServerOption(ClassWithDecorators)).not.toThrowError(msg);
    });

    it('should to throw with https and isHttp2SecureServer == true', () => {
      mockBs.serverOptions = { isHttp2SecureServer: true };
      mockBs.httpModule = https;
      const msg = 'serverModule.createSecureServer() not found (see ClassWithDecorators settings)';
      expect(() => mockBs.checkSecureServerOption(ClassWithDecorators)).toThrowError(msg);
    });
  });
});
