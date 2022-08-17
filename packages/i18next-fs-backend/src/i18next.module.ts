import { Module, ModuleWithParams, PRE_ROUTER_EXTENSIONS } from '@ditsmod/core';
import { InitOptions } from 'i18next';

import { I18nextFsBackendExtension } from './i18next-fs-backend.extension';
import { I18NEXT_FS_BACKEND_EXTENSIONS, I18NEXT_FS_BACKEND_OPTIONS } from './types/mix';

@Module({
  extensions: [[I18NEXT_FS_BACKEND_EXTENSIONS, PRE_ROUTER_EXTENSIONS, I18nextFsBackendExtension]],
})
export class I18nextFsBackendModule {
  static withParams(options: InitOptions = {}): ModuleWithParams<I18nextFsBackendModule> {
    return {
      module: this,
      providersPerMod: [{ provide: I18NEXT_FS_BACKEND_OPTIONS, useValue: options }],
    };
  }
}
