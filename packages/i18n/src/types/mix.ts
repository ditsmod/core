import { Extension, InjectionToken, Class } from '@ditsmod/core';
import { ISO639 } from './iso-639.js';

export interface Dictionary {
  getLng(): ISO639;
  [key: string]: any;
}

export class Translations {
  constructor(public current?: DictGroup[], public imported?: DictGroup[]) {}
}

export class I18nOptions {
  defaultLng?: ISO639;
  lngParam?: string = 'lng';
}
export type DictGroup<T extends Class<Dictionary> = Class<Dictionary>> = [T, ...T[]];
/**
 * A group of extensions that add dictionaries to providers for internalization.
 */
export const I18N_EXTENSIONS = new InjectionToken<Extension<void>>('I18N_EXTENSIONS');
/**
 * Current and imported dictionaries for internalization.
 */
export const I18N_TRANSLATIONS = new InjectionToken<Translations[]>('I18N_TRANSLATIONS');
