import 'reflect-metadata';
import { Injectable, ReflectiveInjector } from '@ts-stack/di';

import { Logger, LoggerConfig } from '../types/logger';
import { PreRoutes } from './pre-routes';
import { ExtensionMetadata } from '../types/extension-metadata';
import { Controller, ControllerMetadata } from '../decorators/controller';
import { Route } from '../decorators/route';
import { RootModule } from '../decorators/root-module';
import { CanActivate } from '../types/mix';
import { defaultProvidersPerApp } from './default-providers-per-app';
import { RootMetadata } from '../models/root-metadata';
import { ModuleManager } from './module-manager';
import { DefaultLogger } from './default-logger';
import { AppInitializer } from './app-initializer';

xdescribe('PreRoutes', () => {
  class MockPreRoutes extends PreRoutes {
    getRoutesData(moduleName: string, prefixPerApp: string, prefixPerMod: string, extensionMetadata: ExtensionMetadata) {
      return super.getRoutesData(moduleName, prefixPerApp, prefixPerMod, extensionMetadata);
    }
  }

  @Injectable()
  class MockAppInitializer extends AppInitializer {
    moduleManager: ModuleManager;
    injectorPerApp: ReflectiveInjector;
    log = new Logger();
    meta = new RootMetadata();

    bootstrapModuleFactory(moduleManager: ModuleManager) {
      return super.bootstrapModuleFactory(moduleManager);
    }
  }

  let mockAppInitializer: MockAppInitializer;
  let mockPreRoutes: MockPreRoutes;
  let log: Logger;
  let moduleManager: ModuleManager;

  beforeEach(() => {
    const config = new LoggerConfig();
    log = new DefaultLogger(config);
    moduleManager = new ModuleManager(log);
    const injectorPerApp = ReflectiveInjector.resolveAndCreate([
      ...defaultProvidersPerApp,
      { provide: ModuleManager, useValue: moduleManager },
      { provide: RootMetadata, useValue: new RootMetadata() },
      MockAppInitializer,
    ]);
    mockAppInitializer = injectorPerApp.get(MockAppInitializer);
    mockAppInitializer.injectorPerApp = injectorPerApp;
    // mockPreRoutes = new MockPreRoutes(injectorPerApp);
  });

  describe('getRoutesData()', () => {
    it('bad guard', () => {
      const ctrlMetadata = { providersPerReq: [] } as ControllerMetadata;
      class MyGuard {}
      @Controller(ctrlMetadata)
      class Controller1 {
        @Route('GET', 'url1', [MyGuard as any])
        method1() {}
      }

      @RootModule({
        controllers: [Controller1],
      })
      class AppModule {}

      moduleManager.scanRootModule(AppModule);
      const metadataMap = mockAppInitializer.bootstrapModuleFactory(moduleManager);
      const extensionMeta = metadataMap.get(AppModule);
      // expect(() => mockPreRoutes.getRoutesData(extensionMeta)).toThrowError(/must have canActivate method/);
    });

    it('three decorators with two methods', () => {
      const ctrlMetadata = { providersPerReq: [] } as ControllerMetadata;
      class MyGuard1 implements CanActivate {
        canActivate() {
          return true;
        }
      }
      class MyGuard2 implements CanActivate {
        canActivate() {
          return true;
        }
      }
      @Controller(ctrlMetadata)
      class Controller1 {
        @Route('GET', 'url1', [MyGuard1, [MyGuard2, 'one', 2]])
        method1() {}

        @Route('POST', 'url2')
        @Route('GET', 'url3')
        method2() {}
      }

      @RootModule({
        controllers: [Controller1],
      })
      class AppModule {}

      moduleManager.scanRootModule(AppModule);
      const metadataMap = mockAppInitializer.bootstrapModuleFactory(moduleManager);
      const metadata = metadataMap.get(AppModule);
      // const routesMetadata = mockPreRoutes.getRoutesData(metadata);
      // expect(routesMetadata.length).toBe(3);
      // expect(routesMetadata[0].decoratorMetadata.otherDecorators).toEqual([]);
      // expect(routesMetadata[0].decoratorMetadata.otherDecorators.map(d => d.ngMetadataName)).toEqual([]);
      // expect(routesMetadata[0].controller).toBe(Controller1);
      // expect(routesMetadata[0].methodName).toBe('method1');
      // expect(routesMetadata[0].route.httpMethod).toBe('GET');
      // expect(routesMetadata[0].route.path).toBe('url1');
      // expect(routesMetadata[0].route.guards.length).toBeGreaterThan(0);
      // expect(routesMetadata[0].providers.length).toBeGreaterThan(0);
      // expect(routesMetadata[0].injector).toBeDefined();
      // expect(routesMetadata[0].parseBody).toBe(false);
      // expect(routesMetadata[0].guards).toEqual([{ guard: MyGuard1 }, { guard: MyGuard2, params: ['one', 2] }]);

      // expect(routesMetadata[1].decoratorMetadata.otherDecorators).toEqual([{ guards: [], httpMethod: 'GET', path: 'url3' }]);
      // expect(routesMetadata[1].decoratorMetadata.otherDecorators.map(d => d.ngMetadataName)).toEqual(['Route']);
      // expect(routesMetadata[1].controller).toBe(Controller1);
      // expect(routesMetadata[1].methodName).toBe('method2');
      // expect(routesMetadata[1].route.httpMethod).toBe('POST');
      // expect(routesMetadata[1].route.path).toBe('url2');
      // expect(routesMetadata[1].route.guards).toEqual([]);
      // expect(routesMetadata[1].providers.length).toBeGreaterThan(0);
      // expect(routesMetadata[1].injector).toBeDefined();
      // expect(routesMetadata[1].parseBody).toBe(true);
      // expect(routesMetadata[1].guards).toEqual([]);

      // expect(routesMetadata[2].decoratorMetadata.otherDecorators).toEqual([{ guards: [], httpMethod: 'POST', path: 'url2' }]);
      // expect(routesMetadata[2].decoratorMetadata.otherDecorators.map(d => d.ngMetadataName)).toEqual(['Route']);
      // expect(routesMetadata[2].controller).toBe(Controller1);
      // expect(routesMetadata[2].methodName).toBe('method2');
      // expect(routesMetadata[2].route.httpMethod).toBe('GET');
      // expect(routesMetadata[2].route.path).toBe('url3');
      // expect(routesMetadata[2].route.guards).toEqual([]);
      // expect(routesMetadata[2].providers.length).toBeGreaterThan(0);
      // expect(routesMetadata[2].injector).toBeDefined();
      // expect(routesMetadata[2].parseBody).toBe(false);
      // expect(routesMetadata[2].guards).toEqual([]);
    });
  });
});
