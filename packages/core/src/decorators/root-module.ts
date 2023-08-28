import { makeClassDecorator } from '#di';
import { ModuleMetadata } from '#types/module-metadata.js';
import { RootModuleMetadata } from '#types/root-module-metadata.js';

export const rootModule = makeClassDecorator((data: Omit<ModuleMetadata, 'id'> & RootModuleMetadata) => data);
