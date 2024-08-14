import { Providers, Class } from '@ditsmod/core';
import { Dictionary, DictGroup, Translations, I18N_TRANSLATIONS, I18nOptions } from './types/mix.js';

export function getDictGroup<T extends Class<Dictionary>>(base: T, ...dicts: T[]): DictGroup {
  return [base, ...dicts];
}

export class I18nProviders extends Providers {
  /**
   * Helper that adds providers in a type safe way.
   */
  i18n(translations: Translations, i18nOptions?: I18nOptions) {
    if (!this.true) {
      return this.self;
    }

    this.useValue<Translations>(I18N_TRANSLATIONS, translations, true);

    if (i18nOptions) {
      this.useValue(I18nOptions, i18nOptions);
    }

    return this.self;
  }
}
