import { Injectable, Inject } from '@ts-stack/di';
import { edk, Logger } from '@ditsmod/core';

@Injectable()
export class MyExtension implements edk.Extension {
  #inited: boolean;

  constructor(
    @Inject(edk.EXTENSIONS_MAP) private extensionsMap: edk.ExtensionsMap,
    private extensionsManager: edk.ExtensionsManager,
    private log: Logger
  ) {}

  async init() {
    if (this.#inited) {
      return;
    }

    this.log.info(this.extensionsMap);
    const preRouteMeta = await this.extensionsManager.init(edk.ROUTES_EXTENSIONS);
    this.log.info(preRouteMeta);

    this.#inited = true;
  }
}
