import { LoggerConfig, LogMediatorConfig, Module, FilterConfig } from '@ditsmod/core';
import { I18nModule, I18nOptions, I18N_TRANSLATIONS, Translation } from '@ditsmod/i18n';

import { FirstModule } from '../first/first.module';
import { SecondController } from './second.controller';
import { current } from './locales/current/translations';
import { imported } from './locales/imported/first/translations';

const loggerConfig = new LoggerConfig('info');
const filterConfig: FilterConfig = { classesNames: ['I18nExtension'] };
const i18nOptions: I18nOptions = { defaultLng: 'uk' };
const translations: Translation = { current, imported };

@Module({
  imports: [I18nModule, FirstModule],
  controllers: [SecondController],
  providersPerMod: [
    { provide: LoggerConfig, useValue: loggerConfig },
    { provide: LogMediatorConfig, useValue: { filterConfig } },
    { provide: I18nOptions, useValue: i18nOptions },
    { provide: I18N_TRANSLATIONS, useValue: translations, multi: true },
  ],
})
export class SecondModule {}
