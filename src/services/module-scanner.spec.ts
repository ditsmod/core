import 'reflect-metadata';
import * as http from 'http';
import { Injectable, forwardRef } from '@ts-stack/di';

import { RootModule } from '../decorators/root-module';
import { NormalizedModuleMetadata } from '../models/normalized-module-metadata';
import { ModuleScanner } from './module-scanner';
import { Module } from '../decorators/module';
import { ModuleWithParams } from '../types/module-with-params';
import { ServiceProvider } from '../types/service-provider';

describe('ModuleScanner', () => {
  class MockModuleScanner extends ModuleScanner {}

  let mock: MockModuleScanner;

  beforeEach(() => {
    mock = new MockModuleScanner();
  });

  it('empty root module', () => {
    @RootModule()
    class AppModule {}

    const expectedMetadata: NormalizedModuleMetadata = {
      ngMetadataName: 'RootModule',
    };

    const map = mock.scanModule(AppModule);
    expect(map.size).toBe(1);
    expect(map.get(AppModule)).toEqual(expectedMetadata);
  });

  it('root module with some metadata', () => {
    @RootModule({
      httpModule: http,
      listenOptions: { host: 'localhost', port: 3000 },
      prefixPerApp: 'api',
      serverName: 'Some-Server',
      serverOptions: {},
      imports: [],
      providersPerApp: [],
      controllers: [],
      exports: [],
    })
    class AppModule {}

    const expectedMetadata: NormalizedModuleMetadata = {
      ngMetadataName: 'RootModule',
    };

    const map = mock.scanModule(AppModule);
    expect(map.size).toBe(1);
    expect(map.get(AppModule)).toEqual(expectedMetadata);
  });

  it('root module with imported some other modules', () => {
    const fn = () => module4WithProviders;
    @Module({ id: 1, imports: [forwardRef(fn)] })
    class Module1 {}

    @Injectable()
    class Provider1 {}

    @Module({
      imports: [Module1],
      providersPerMod: [Provider1],
      exports: [Provider1, Module1],
    })
    class Module2 {}

    @Module()
    class Module4 {
      static withParams(providersPerMod: ServiceProvider[]): ModuleWithParams<Module4> {
        return {
          module: Module4,
          providersPerMod,
        };
      }
    }

    @Injectable()
    class Provider2 {}

    const module4WithProviders = Module4.withParams([Provider2]);

    @RootModule({
      httpModule: http,
      listenOptions: { host: 'localhost', port: 3000 },
      prefixPerApp: 'api',
      serverName: 'Some-Server',
      serverOptions: {},
      imports: [Module1, Module2],
      providersPerApp: [],
      controllers: [],
      exports: [],
    })
    class Module3 {}

    const module1Expect: NormalizedModuleMetadata = {
      id: 1,
      importsWithParams: [module4WithProviders],
      ngMetadataName: 'Module',
    };

    const module2Expect: NormalizedModuleMetadata = {
      ngMetadataName: 'Module',
      importsModules: [Module1],
      exportsModules: [Module1],
      exportsProviders: [Provider1],
      providersPerMod: [Provider1],
    };

    const module3Expect: NormalizedModuleMetadata = {
      importsModules: [Module1, Module2],
      ngMetadataName: 'RootModule',
    };

    const module4Expect: NormalizedModuleMetadata = {
      providersPerMod: [Provider2],
      ngMetadataName: 'Module',
    };

    const map = mock.scanModule(Module3);
    expect(map.size).toBe(4);
    expect(map.get(1)).toEqual(module1Expect);
    expect(map.get(Module2)).toEqual(module2Expect);
    expect(map.get(Module3)).toEqual(module3Expect);
    expect(map.get(module4WithProviders)).toEqual(module4Expect);
  });
});
