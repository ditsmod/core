import { XParameterObject, ReferenceObject } from '@ts-stack/openapi-spec';

/**
 * Related to OpenAPI documentation, passed in the module metadata in the `oasOptions` property,
 * used for centrally adding `paratemers` and `tags` to `@OasRoute()` in the current module.
 */
export interface OasOptions {
  paratemers?: (XParameterObject | ReferenceObject)[];
  tags?: string[];
}
