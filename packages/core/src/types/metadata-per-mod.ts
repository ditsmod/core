import { NormalizedModuleMetadata } from '#types/normalized-module-metadata.js';
import { ControllerMetadata } from './controller-metadata.js';
import { GuardPerMod1, ModuleType, Provider } from './mix.js';
import { ModuleWithParams } from './module-metadata.js';
import { ExtensionProvider } from './extension-types.js';

/**
 * @todo Rename this.
 */
export class ImportObj<T extends Provider = Provider> {
  module: ModuleType | ModuleWithParams;
  /**
   * This property can have more than one element for multi-providers only.
   */
  providers: T[] = [];
}

export class GlobalProviders {
  importedProvidersPerMod = new Map<any, ImportObj>();
  importedProvidersPerRou = new Map<any, ImportObj>();
  importedProvidersPerReq = new Map<any, ImportObj>();
  importedMultiProvidersPerMod = new Map<ModuleType | ModuleWithParams, Provider[]>();
  importedMultiProvidersPerRou = new Map<ModuleType | ModuleWithParams, Provider[]>();
  importedMultiProvidersPerReq = new Map<ModuleType | ModuleWithParams, Provider[]>();
  importedExtensions = new Map<ModuleType | ModuleWithParams, ExtensionProvider[]>();
}

/**
 * Metadata collected using `ModuleFactory`.
 */
export class MetadataPerMod1 {
  prefixPerMod: string;
  guardsPerMod1: GuardPerMod1[];
  /**
   * Snapshot of NormalizedModuleMetadata. If you modify any array in this object,
   * the original array will remain unchanged.
   */
  meta: NormalizedModuleMetadata;
  /**
   * Specifies whether to apply controllers in the current module.
   */
  applyControllers: boolean;
  /**
   * Map between a token and its ImportObj per scope.
   */
  importedTokensMap: ImportedTokensMap;
}

export interface ImportedTokensMap {
  perMod: Map<any, ImportObj>;
  perRou: Map<any, ImportObj>;
  perReq: Map<any, ImportObj>;
  multiPerMod: Map<ModuleType | ModuleWithParams, Provider[]>;
  multiPerRou: Map<ModuleType | ModuleWithParams, Provider[]>;
  multiPerReq: Map<ModuleType | ModuleWithParams, Provider[]>;
  extensions: Map<ModuleType | ModuleWithParams, ExtensionProvider[]>;
}

/**
 * This metadata is generated by `ROUTES_EXTENSIONS` group, and available for other extensions
 * that need set routes.
 */
export class MetadataPerMod3 {
  module: ModuleType | ModuleWithParams;
  moduleName: string;
  /**
   * Providers per a module.
   */
  providersPerMod: Provider[];
  /**
   * Providers per a route.
   */
  providersPerRou: Provider[];
  /**
   * Providers per a request.
   */
  providersPerReq: Provider[];
  aControllerMetadata: ControllerMetadata[];
  guardsPerMod1: GuardPerMod1[];
}

/**
 * This metadata returns from `ImportsResolver`.
 */
export class MetadataPerMod2 {
  applyControllers: boolean;
  prefixPerMod: string;
  meta: NormalizedModuleMetadata;
  guardsPerMod1: GuardPerMod1[];
}
