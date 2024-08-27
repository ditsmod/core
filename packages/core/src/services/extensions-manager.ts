import { EXTENSIONS_COUNTERS } from '#constans';
import { Class, BeforeToken, Injector, KeyRegistry, inject, injectable } from '#di';
import { SystemLogMediator } from '#logger/system-log-mediator.js';
import {
  ExtensionsGroupToken,
  Extension,
  ExtensionInitMeta,
  ExtensionManagerInitMeta,
} from '#types/extension-types.js';
import { getProviderName } from '#utils/get-provider-name.js';
import { isInjectionToken } from '#utils/type-guards.js';
import { Counter } from './counter.js';
import { ExtensionsContext } from './extensions-context.js';

@injectable()
export class ExtensionsManager {
  /**
   * Settings by AppInitializer.
   */
  moduleName: string = '';
  /**
   * Settings by AppInitializer.
   */
  beforeTokens = new Set<BeforeToken>();
  protected unfinishedInit = new Set<Extension<any> | ExtensionsGroupToken<any>>();
  protected cache = new Map<ExtensionsGroupToken, ExtensionManagerInitMeta>();

  constructor(
    protected injector: Injector,
    protected systemLogMediator: SystemLogMediator,
    protected counter: Counter,
    protected extensionsContext: ExtensionsContext,
    @inject(EXTENSIONS_COUNTERS) protected mExtensionsCounters: Map<Class<Extension<any>>, number>,
  ) {}

  async init<T>(groupToken: ExtensionsGroupToken<T>, perApp?: boolean): Promise<ExtensionManagerInitMeta<T>> {
    if (this.unfinishedInit.has(groupToken)) {
      this.throwCircularDeps(groupToken);
    }
    const beforeToken = KeyRegistry.getBeforeToken(groupToken);
    if (!this.cache.has(beforeToken) && this.beforeTokens.has(beforeToken)) {
      await this.prepareAndInitGroup<T>(beforeToken);
    }

    return this.cache.get(groupToken) || this.prepareAndInitGroup<T>(groupToken);
  }

  protected async prepareAndInitGroup<T>(groupToken: ExtensionsGroupToken<T>) {
    this.unfinishedInit.add(groupToken);
    this.systemLogMediator.startExtensionsGroupInit(this, this.unfinishedInit);
    const totalInitMeta = await this.initGroup(groupToken);
    this.systemLogMediator.finishExtensionsGroupInit(this, this.unfinishedInit);
    this.unfinishedInit.delete(groupToken);
    this.cache.set(groupToken, totalInitMeta);
    this.extensionsContext.aTotalInitMeta.push(totalInitMeta);
    return totalInitMeta;
  }

  protected async initGroup<T>(groupToken: ExtensionsGroupToken<any>): Promise<ExtensionManagerInitMeta> {
    const extensions = this.injector.get(groupToken, undefined, []) as Extension<T>[];
    const groupInitMeta: ExtensionInitMeta<T>[] = [];
    const totalInitMeta = new ExtensionManagerInitMeta(this.moduleName, groupInitMeta);

    if (!extensions.length) {
      this.systemLogMediator.noExtensionsFound(this, groupToken);
    }

    for (const extension of extensions) {
      if (this.unfinishedInit.has(extension)) {
        this.throwCircularDeps(extension);
      }

      this.unfinishedInit.add(extension);
      this.systemLogMediator.startInitExtension(this, this.unfinishedInit);
      const countdown = this.mExtensionsCounters.get(extension.constructor as Class<Extension<T>>) || 0;
      const isLastExtensionCall = countdown === 0;
      const data = await extension.init(isLastExtensionCall);
      this.systemLogMediator.finishInitExtension(this, this.unfinishedInit, data);
      this.counter.addInitedExtensions(extension);
      this.unfinishedInit.delete(extension);
      totalInitMeta.countdown = Math.max(totalInitMeta.countdown, countdown);
      if (!totalInitMeta.delay && !isLastExtensionCall) {
        totalInitMeta.delay = true;
      }
      const initMeta = new ExtensionInitMeta(extension, data, !isLastExtensionCall, countdown);
      groupInitMeta.push(initMeta);
    }

    return totalInitMeta;
  }

  protected throwCircularDeps(item: Extension<any> | ExtensionsGroupToken<any>) {
    const items = Array.from(this.unfinishedInit);
    const index = items.findIndex((ext) => ext === item);
    const prefixChain = items.slice(0, index);
    const circularChain = items.slice(index);
    const prefixNames = prefixChain.map(this.getItemName).join(' -> ');
    let circularNames = circularChain.map(this.getItemName).join(' -> ');
    circularNames += ` -> ${this.getItemName(item)}`;
    let msg = `Detected circular dependencies: ${circularNames}.`;
    if (prefixNames) {
      msg += ` It is started from ${prefixNames}.`;
    }
    throw new Error(msg);
  }

  protected getItemName(tokenOrExtension: Extension<any> | ExtensionsGroupToken<any>) {
    if (isInjectionToken(tokenOrExtension) || typeof tokenOrExtension == 'string') {
      return getProviderName(tokenOrExtension);
    } else {
      return tokenOrExtension.constructor.name;
    }
  }
}
