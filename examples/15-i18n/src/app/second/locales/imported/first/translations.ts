import { DictGroup, getDictGroup } from '@ditsmod/i18n';

import { CommonDict } from '@dict/first/common.dict';
import { CommonUkDict } from './uk/common-uk.dict';

export const imported: DictGroup[] = [
  getDictGroup(CommonDict, CommonUkDict),
];
