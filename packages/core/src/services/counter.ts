import { injectable } from '#di';
import { Extension } from '#types/mix.js';

/**
 * Used to collect various statistics.
 */
@injectable()
export class Counter {
  #extensionsManagerId = 0;
  #initedExtensions = new Set<Extension<any>>();

  increaseExtensionsInitId() {
    return ++this.#extensionsManagerId;
  }

  getExtensionsInitId() {
    return this.#extensionsManagerId;
  }

  resetInitedExtensionsSet() {
    this.#initedExtensions = new Set;
  }

  addInitedExtensions(extension: Extension<any>) {
    this.#initedExtensions.add(extension);
  }

  getInitedExtensions() {
    return this.#initedExtensions;
  }
}
