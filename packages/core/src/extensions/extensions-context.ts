import { Class, injectable } from '#di';
import { ExtensionsGroupToken, GroupStage1Meta, Extension } from '#extensions/extension-types.js';
import { ModRefId } from '#types/mix.js';

@injectable()
export class ExtensionsContext {
  mGroupStage1Meta = new Map<ExtensionsGroupToken, GroupStage1Meta[]>();
  /**
   * The pending list of extensions that want to receive the initialization result
   * of `groupToken` from the whole application.
   */
  mExtensionPendingList = new Map<ExtensionsGroupToken, Map<Class<Extension>, Extension>>();

  mStage = new Map<ModRefId, Set<Extension>>();
}
