import { TranslationTuple } from '@ditsmod/i18n';

import { Common } from './en/common';
import { CommonUk } from './uk/common';
import { Errors } from './en/errors';
import { ErrorsUk } from './uk/errors';

export const currentTranslations: TranslationTuple[] = [
  [Common, CommonUk],
  [Errors, ErrorsUk],
];
