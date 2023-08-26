import { Class } from '@ditsmod/core';
import { Dictionary } from '@ditsmod/i18n';
import { OasRouteMeta } from '@ditsmod/openapi';
import { XParameterObject, XSchemaObject } from '@ts-stack/openapi-spec';

import { ValidationOptions } from './validation-options.js';

export class ValidationRouteMeta extends OasRouteMeta {
  parameters: XParameterObject[];
  requestBodySchema: XSchemaObject;
  options: ValidationOptions;
}

/**
 * This OAS property contains validation error arguments.
 */
export const INVALID_ARGS = 'x-invalid-args';

interface ValidArgsObj<T extends Class<Dictionary>> {
  [INVALID_ARGS]: InvalidArgsValue<T>;
}

/**
 * For now, it's not in index.ts
 */
export type InvalidArgsValue<T extends Class<Dictionary>> = [T, keyof T['prototype'], ...any[]];

/**
 * For now, it's not in index.ts
 */
export function getInvalidArgs<D extends Class<Dictionary>, K extends keyof Omit<D['prototype'], 'getLng'>>(
  dict: D,
  key: K,
  ...args: Parameters<D['prototype'][K]>
): ValidArgsObj<D> {
  return { [INVALID_ARGS]: [dict, key, ...args] };
}
