import { Type, reflector } from 'ts-di';

import { isModuleWithOptions } from './utils/type-guards';
import { ModuleWithOptions, ModuleDecorator } from './decorators/module';
import { mergeArrays } from './utils/merge-arrays-options';
import { RootModuleDecorator } from './decorators/root-module';

export abstract class Factory {
  protected getModuleName(typeOrObject: Type<any> | ModuleWithOptions<any>) {
    return isModuleWithOptions(typeOrObject) ? typeOrObject.module.name : typeOrObject.name;
  }

  protected checkModuleMetadata(modMetadata: ModuleDecorator, modName: string) {
    if (!modMetadata) {
      throw new Error(`Module build failed: module "${modName}" does not have the "@Module()" decorator`);
    }
  }

  protected getRawModuleMetadata<T extends ModuleDecorator>(
    typeOrObject: Type<any> | ModuleWithOptions<any>,
    checker: (arg: RootModuleDecorator | ModuleDecorator) => boolean
  ) {
    let modMetadata: T;

    if (isModuleWithOptions(typeOrObject)) {
      const modWitOptions = typeOrObject;

      modMetadata = reflector.annotations(modWitOptions.module).find(checker) as T;

      const modName = this.getModuleName(modWitOptions.module);
      this.checkModuleMetadata(modMetadata, modName);

      modMetadata.providersPerApp = mergeArrays(modWitOptions.providersPerApp, modMetadata.providersPerApp);
      modMetadata.providersPerMod = mergeArrays(modWitOptions.providersPerMod, modMetadata.providersPerMod);
      modMetadata.providersPerReq = mergeArrays(modWitOptions.providersPerReq, modMetadata.providersPerReq);
    } else {
      modMetadata = reflector.annotations(typeOrObject).find(checker) as T;
    }

    return modMetadata;
  }
}
