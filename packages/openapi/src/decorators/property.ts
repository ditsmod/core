import { AnyObj } from '@ditsmod/core';
import { makePropTypeDecorator, Type } from '@ts-stack/di';
import { XSchemaObject } from '@ts-stack/openapi-spec';

export type AnyEnum<T extends number | string = number | string> = Record<T, T>;

export interface CustomType {
  array?: Type<AnyObj> | Type<AnyObj>[];
  enum?: AnyEnum | AnyEnum[];
}
export type PropertyDecoratorFactory = (schema?: XSchemaObject, customType?: CustomType) => PropertyDecorator;
export interface PropertyDecoratorItem {
  schema?: XSchemaObject;
  customType?: CustomType;
}
export type PropertyDecoratorValue = [Type<AnyObj>, PropertyDecoratorItem, ...PropertyDecoratorItem[]];
export interface PropertyDecoratorMetadata {
  [key: string]: PropertyDecoratorValue;
}

function transformPropertyMeta(schema?: XSchemaObject, customType?: CustomType) {
  return { schema, customType };
}

/**
 * Decorator for model properties.
 * 
 * Usage:
 * 
 * ```ts
class Post {
  @Property({ type: 'number', minimum: 0, maximum: 100000 })
  postId: number;
}
 * ```
 */
export const Property = makePropTypeDecorator('Property', transformPropertyMeta) as PropertyDecoratorFactory;
