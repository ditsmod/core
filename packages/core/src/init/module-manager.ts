import { format } from 'util';

import { Injector, reflector } from '#di';
import { SystemLogMediator } from '#logger/system-log-mediator.js';
import { AnyObj, ModuleType, ModRefId } from '#types/mix.js';
import { ModuleWithParams } from '#types/module-metadata.js';
import { NormalizedModuleMetadata } from '#types/normalized-module-metadata.js';
import { isModuleWithParams, isRootModule } from '#utils/type-guards.js';
import { clearDebugClassNames, getDebugClassName } from '#utils/get-debug-class-name.js';
import { objectKeys } from '#utils/object-keys.js';
import { ModuleNormalizer } from '#init/module-normalizer.js';
import { ChainError } from '@ts-stack/chain-error';

export type ModulesMap = Map<ModRefId, NormalizedModuleMetadata>;
export type ModulesMapId = Map<string, ModRefId>;
type ModuleId = string | ModRefId;

/**
 * Scans modules, normalizes, stores and checks their metadata for correctness,
 * adds and removes imports of one module into another.
 */
export class ModuleManager {
  protected injectorPerModMap = new Map<ModRefId, Injector>();
  protected map: ModulesMap = new Map();
  protected mapId = new Map<string, ModRefId>();
  protected oldMap: ModulesMap = new Map();
  protected oldMapId = new Map<string, ModRefId>();
  protected unfinishedScanModules = new Set<ModRefId>();
  protected scanedModules = new Set<ModRefId>();
  protected moduleNormalizer = new ModuleNormalizer();
  protected propsWithModules = [
    'importsModules',
    'importsWithParams',
    'exportsModules',
    'exportsWithParams',
    'appendsModules',
    'appendsWithParams',
  ] as const;

  constructor(protected systemLogMediator: SystemLogMediator) {}

  /**
   * Creates a snapshot of `NormalizedModuleMetadata` for the root module, stores locally and returns it.
   * You can also get the result this way: `moduleManager.getMetadata('root')`.
   */
  scanRootModule(appModule: ModuleType) {
    if (!reflector.getDecorators(appModule, isRootModule)) {
      throw new Error(`Module scaning failed: "${appModule.name}" does not have the "@rootModule()" decorator`);
    }

    const meta = this.scanRawModule(appModule);
    this.injectorPerModMap.clear();
    this.unfinishedScanModules.clear();
    this.scanedModules.clear();
    clearDebugClassNames();
    this.mapId.set('root', appModule);
    return this.copyMeta(meta);
  }

  /**
   * Returns a snapshot of `NormalizedModuleMetadata` for a module.
   */
  scanModule(modOrObj: ModuleType | ModuleWithParams) {
    const meta = this.scanRawModule(modOrObj);
    return this.copyMeta(meta);
  }

  /**
   * Returns a snapshot of `NormalizedModuleMetadata` for given module or module ID.
   */
  getMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(
    moduleId: ModuleId,
    throwErrIfNotFound?: false,
  ): NormalizedModuleMetadata<T, A> | undefined;
  getMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(
    moduleId: ModuleId,
    throwErrIfNotFound: true,
  ): NormalizedModuleMetadata<T, A>;
  getMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(moduleId: ModuleId, throwErrIfNotFound?: boolean) {
    const meta = this.getRawMetadata<T, A>(moduleId, throwErrIfNotFound);
    if (meta) {
      return this.copyMeta(meta);
    } else {
      return;
    }
  }

  /**
   * If `inputModule` added, returns `true`, otherwise - returns `false`.
   *
   * @param inputModule Module to be added.
   * @param targetModuleId Module ID to which the input module will be added.
   */
  addImport(inputModule: ModRefId, targetModuleId: ModuleId = 'root'): boolean | void {
    const targetMeta = this.getRawMetadata(targetModuleId);
    if (!targetMeta) {
      const modName = getDebugClassName(inputModule);
      const modIdStr = format(targetModuleId);
      const msg = `Failed adding ${modName} to imports: target module with ID "${modIdStr}" not found.`;
      throw new Error(msg);
    }

    const prop = isModuleWithParams(inputModule) ? 'importsWithParams' : 'importsModules';
    if (targetMeta[prop].some((imp: ModRefId) => imp === inputModule)) {
      const modIdStr = format(targetModuleId);
      this.systemLogMediator.moduleAlreadyImported(this, inputModule, modIdStr);
      return false;
    }

    this.startTransaction();
    try {
      (targetMeta[prop] as ModRefId[]).push(inputModule);
      this.scanRawModule(inputModule);
      this.systemLogMediator.successfulAddedModuleToImport(this, inputModule, targetMeta.name);
      return true;
    } catch (err) {
      this.rollback(err as Error);
    }
  }

  /**
   * @param targetModuleId Module ID from where the input module will be removed.
   */
  removeImport(inputModuleId: ModuleId, targetModuleId: ModuleId = 'root'): boolean | void {
    const inputMeta = this.getRawMetadata(inputModuleId);
    if (!inputMeta) {
      const modIdStr = format(inputModuleId);
      this.systemLogMediator.moduleNotFound(this, modIdStr);
      return false;
    }

    const targetMeta = this.getRawMetadata(targetModuleId);
    if (!targetMeta) {
      const modIdStr = format(targetModuleId);
      const msg = `Failed removing ${inputMeta.name} from "imports" array: target module with ID "${modIdStr}" not found.`;
      throw new Error(msg);
    }
    const prop = isModuleWithParams(inputMeta.modRefId) ? 'importsWithParams' : 'importsModules';
    const index = targetMeta[prop].findIndex((imp: ModRefId) => imp === inputMeta.modRefId);
    if (index == -1) {
      const modIdStr = format(inputModuleId);
      this.systemLogMediator.moduleNotFound(this, modIdStr);
      return false;
    }

    this.startTransaction();
    try {
      targetMeta[prop].splice(index, 1);
      if (!this.includesInSomeModule(inputModuleId, 'root')) {
        if (inputMeta.id) {
          this.mapId.delete(inputMeta.id);
        }
        this.map.delete(inputMeta.modRefId);
      }
      this.systemLogMediator.moduleSuccessfulRemoved(this, inputMeta.name, targetMeta.name);
      return true;
    } catch (err) {
      this.rollback(err as Error);
    }
  }

  commit() {
    this.oldMapId = new Map();
    this.oldMap = new Map();
  }

  rollback(err?: Error) {
    if (!this.oldMapId.size) {
      throw new Error('It is forbidden for rollback() to an empty state.');
    }
    this.mapId = this.oldMapId;
    this.map = this.oldMap;
    this.commit();
    if (err) {
      throw err;
    }
  }

  /**
   * Returns shapshot of current map for all modules.
   */
  getModulesMap() {
    return new Map(this.map);
  }

  setInjectorPerMod(moduleId: ModuleId, injectorPerMod: Injector) {
    if (typeof moduleId == 'string') {
      const mapId = this.mapId.get(moduleId);
      if (mapId) {
        this.injectorPerModMap.set(mapId, injectorPerMod);
      } else {
        throw new Error(`${moduleId} not found in ModuleManager.`);
      }
    } else {
      this.injectorPerModMap.set(moduleId, injectorPerMod);
    }
  }

  getInjectorPerMod(moduleId: ModuleId) {
    if (typeof moduleId == 'string') {
      const mapId = this.mapId.get(moduleId);
      if (mapId) {
        return this.injectorPerModMap.get(mapId)!;
      } else {
        throw new Error(`${moduleId} not found in ModuleManager.`);
      }
    } else {
      return this.injectorPerModMap.get(moduleId)!;
    }
  }

  /**
   * Here "raw" means that it returns "raw" normalized metadata (without `this.copyMeta()`).
   */
  protected scanRawModule(modRefId: ModRefId) {
    const meta = this.normalizeMetadata(modRefId);

    // Merging arrays with this props in one array.
    const inputs = this.propsWithModules.map((p) => meta[p]).reduce<ModRefId[]>((prev, curr) => prev.concat(curr), []);

    for (const input of inputs) {
      if (this.unfinishedScanModules.has(input) || this.scanedModules.has(input)) {
        continue;
      }
      this.unfinishedScanModules.add(input);
      this.scanRawModule(input);
      this.unfinishedScanModules.delete(input);
      this.scanedModules.add(input);
    }

    if (meta.id) {
      this.mapId.set(meta.id, modRefId);
      this.systemLogMediator.moduleHasId(this, meta.id);
    }
    this.map.set(modRefId, meta);
    return meta;
  }

  protected copyMeta<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(meta: NormalizedModuleMetadata<T, A>) {
    meta = { ...(meta || ({} as NormalizedModuleMetadata<T, A>)) };
    objectKeys(meta).forEach((p) => {
      if (Array.isArray(meta[p])) {
        (meta as any)[p] = meta[p].slice();
      }
    });
    return meta;
  }

  /**
   * Returns normalized metadata, but without `this.copyMeta()`.
   */
  protected getRawMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(
    moduleId: ModuleId,
    throwErrIfNotFound?: boolean,
  ): NormalizedModuleMetadata<T, A> | undefined;
  protected getRawMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(
    moduleId: ModuleId,
    throwErrIfNotFound: true,
  ): NormalizedModuleMetadata<T, A>;
  protected getRawMetadata<T extends AnyObj = AnyObj, A extends AnyObj = AnyObj>(
    moduleId: ModuleId,
    throwErrIfNotFound?: boolean,
  ) {
    let meta: NormalizedModuleMetadata<T, A> | undefined;
    if (typeof moduleId == 'string') {
      const mapId = this.mapId.get(moduleId);
      if (mapId) {
        meta = this.map.get(mapId) as NormalizedModuleMetadata<T, A>;
      }
    } else {
      meta = this.map.get(moduleId) as NormalizedModuleMetadata<T, A>;
    }

    if (throwErrIfNotFound && !meta) {
      let moduleName: string;
      if (typeof moduleId == 'string') {
        moduleName = moduleId;
      } else {
        moduleName = getDebugClassName(moduleId);
      }
      throw new Error(`${moduleName} not found in ModuleManager.`);
    }

    return meta;
  }

  protected startTransaction() {
    if (this.oldMapId.has('root')) {
      // Transaction already started.
      return false;
    }

    this.map.forEach((meta, key) => {
      const oldMeta = { ...meta };
      this.propsWithModules.forEach((p) => {
        (oldMeta as any)[p] = (oldMeta as any)[p].slice();
      });

      this.oldMap.set(key, oldMeta);
    });
    this.oldMapId = new Map(this.mapId);

    return true;
  }

  /**
   * Recursively searches for input module.
   * Returns true if input module includes in imports/exports of target module.
   *
   * @param inputModuleId The module you need to find.
   * @param targetModuleId Module where to search `inputModule`.
   */
  protected includesInSomeModule(inputModuleId: ModuleId, targetModuleId: ModuleId): boolean {
    const targetMeta = this.getRawMetadata(targetModuleId);
    if (!targetMeta) {
      return false;
    }

    const aModRefId = this.propsWithModules
      .map((p) => targetMeta[p])
      .reduce<ModRefId[]>((prev, curr) => prev.concat(curr), []);

    return (
      aModRefId.some((modRefId) => inputModuleId === modRefId) ||
      aModRefId.some((modRefId) => this.includesInSomeModule(inputModuleId, modRefId))
    );
  }

  protected normalizeMetadata(modRefId: ModRefId): NormalizedModuleMetadata {
    try {
      return this.moduleNormalizer.normalize(modRefId);
    } catch (err: any) {
      const moduleName = getDebugClassName(modRefId);
      let path = [...this.unfinishedScanModules].map((id) => getDebugClassName(id)).join(' -> ');
      path = this.unfinishedScanModules.size > 1 ? `${moduleName} (${path})` : `${moduleName}`;
      throw new ChainError(`Normalization of ${path} failed`, err);
    }
  }
}
