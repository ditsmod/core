import {
  AppendsWithParams,
  ModuleManager,
  ModuleType,
  ModuleWithParams,
  NormalizedModuleMetadata,
  PreRouterExtension,
  LogLevel,
} from '@ditsmod/core';

import { TestPreRouterExtension } from './test-pre-router.extensions';
import { TestProvider } from './types';

type AnyModule = ModuleType | ModuleWithParams | AppendsWithParams;

export class TestModuleManager extends ModuleManager {
  protected providersToOverride: TestProvider[] = [];
  protected logLevel: LogLevel;

  overrideProviders(providers: TestProvider[]) {
    this.providersToOverride = providers;
  }

  /**
   * This `logLevel` is set after the HTTP request handlers are installed.
   * It does not cover application initialization time.
   */
  setLogLevel(logLevel: LogLevel) {
    this.logLevel = logLevel;
  }

  getLogLevel() {
    return this.logLevel || 'off';
  }

  getProvidersToOverride() {
    return this.providersToOverride;
  }

  protected override normalizeMetadata(mod: AnyModule): NormalizedModuleMetadata {
    const meta = super.normalizeMetadata(mod);
    meta.extensionsProviders.push({ token: PreRouterExtension, useClass: TestPreRouterExtension });
    meta.providersPerApp.push({ token: TestModuleManager, useToken: ModuleManager });
    return meta;
  }
}
