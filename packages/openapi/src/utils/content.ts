import { AnyObj } from '@ditsmod/core';
import { reflector, Type } from '@ts-stack/di';
import {
  SchemaObject,
  SchemaObjectType,
  XEncodingObject,
  XMediaTypeObject,
  XSchemaObject,
} from '@ts-stack/openapi-spec';

import { REQUIRED } from '../constants';
import { AnyEnum, PropertyDecoratorMetadata, CustomType } from '../decorators/property';
import { mediaTypeName } from '../types/media-types';
import { isProperty } from './type-guards';

export interface ContentOptions<T extends mediaTypeName = mediaTypeName> {
  mediaType: T;
  mediaTypeParams?: string;
  model?: Type<AnyObj>;
  /**
   * A map between a property name and its encoding information. The key, being the property name,
   * MUST exist in the schema as a property. The encoding object SHALL only apply to `requestBody`
   * objects when the media type is `multipart` or `application/x-www-form-urlencoded`.
   */
  encoding?: { [encodingName: string]: XEncodingObject };
}

export class Content {
  protected content: { [mediaTypeName: string]: XMediaTypeObject } = {};
  protected scanInProgress = new WeakSet();
  protected standartTypes = [Boolean, Number, String, Array, Object];
  protected standartTypesStrings = ['boolean', 'number', 'string', 'array', 'object'];

  /**
   * Sets media type.
   */
  set<T extends mediaTypeName = mediaTypeName>(contentOptions: ContentOptions<T>) {
    const { mediaType, mediaTypeParams, model } = contentOptions;
    let schema: SchemaObject = {};
    if (mediaType.includes('text/')) {
      schema = { type: 'string' } as SchemaObject;
    } else {
      if (model) {
        schema = this.getSchema(model);
      }
    }

    const params = mediaTypeParams ? `;${mediaTypeParams}` : '';
    this.content[`${mediaType}${params}`] = { schema, encoding: contentOptions.encoding } as XMediaTypeObject;

    return this;
  }

  get<T extends mediaTypeName = mediaTypeName>(contentOptions?: ContentOptions<T>) {
    if (contentOptions) {
      this.set(contentOptions);
    }
    return { ...this.content };
  }

  protected getSchema(model: Type<AnyObj>) {
    const schema = this.getSchemaStubForModel(model);
    const modelMeta = reflector.propMetadata(model) as PropertyDecoratorMetadata;

    for (const property in modelMeta) {
      const propertyMeta = modelMeta[property].find(isProperty);
      if (propertyMeta && (!propertyMeta.schema?.type || propertyMeta.schema.type == 'array')) {
        const propertyType = modelMeta[property][0];
        this.checkTypeDefinitionConflict(model.name, property, propertyType, schema.type, propertyMeta.customType);
        if (!schema.properties) {
          schema.properties = {};
        }
        this.setRequiredProperties(schema, property, propertyMeta.schema);
        schema.properties[property] = this.fillPropertySchema(
          model,
          propertyType,
          propertyMeta.schema,
          propertyMeta.customType
        );
      }
    }

    this.scanInProgress.delete(model);
    return schema;
  }

  /**
   * Sets minimum properties for the model's schema:
   * - `type` if it's standart model (Boolean, Number, String, Array, Object);
   * - init empty `items` and `properties` if it's suitable.
   */
  protected getSchemaStubForModel(model: Type<AnyObj>) {
    const schema = {} as SchemaObject;
    if (this.standartTypes.includes(model as any)) {
      schema.type = (model.name?.toLowerCase() || 'null') as SchemaObjectType;
      if (schema.type == 'array' && !schema.items) {
        schema.items = {};
      }
    } else if (model instanceof Type) {
      schema.type = 'object';
      schema.properties = {};
    }
    return schema;
  }

  protected checkTypeDefinitionConflict(
    modelName: string,
    property: string,
    propertyType: Type<AnyObj>,
    type?: SchemaObjectType | SchemaObjectType[],
    customType?: CustomType
  ) {
    if ((type == 'array' || customType?.array) && propertyType.name != 'Array') {
      const msg = `Wrong definition for ${modelName}: property '${property}' is an array or not array?`;
      throw new TypeError(msg);
    }

    if ((propertyType.name == 'Array' || customType?.array) && customType?.enum) {
      const msg = `Wrong definition for ${modelName}: property '${property}' is an enum or an array?`;
      throw new TypeError(msg);
    }
  }

  protected setRequiredProperties(parentSchema: SchemaObject, propertyName: string, schema?: XSchemaObject) {
    if (schema?.[REQUIRED]) {
      if (!parentSchema.required) {
        parentSchema.required = [propertyName];
      } else {
        parentSchema.required.push(propertyName);
      }
      delete schema[REQUIRED];
    }
  }

  protected fillPropertySchema(
    model: Type<AnyObj>,
    propertyType: Type<AnyObj>,
    originPropertySchema?: XSchemaObject,
    customType?: CustomType
  ) {
    let propertySchema: SchemaObject = { ...originPropertySchema } || {};

    if (customType?.enum) {
      this.fillEnum(propertySchema, customType.enum);
    } else if (this.standartTypes.includes(propertyType as any)) {
      propertySchema.type = (propertyType.name?.toLowerCase() || 'null') as SchemaObjectType;
    } else if (propertyType instanceof Type) {
      if (this.scanInProgress.has(model)) {
        propertySchema.type = 'object';
        propertySchema.description = `[Circular references to ${model.name}]`;
        propertySchema.properties = {};
      } else {
        this.scanInProgress.add(model);
        Object.assign(propertySchema, this.getSchema(propertyType));
      }
    } else {
      propertySchema.type = 'null';
    }

    if (propertySchema.type == 'array') {
      this.fillItems(model, propertySchema, customType);
    }
    return propertySchema;
  }

  protected fillItems(model: Type<AnyObj>, propertySchema: SchemaObject, customType?: CustomType) {
    if (customType?.array) {
      if (Array.isArray(customType.array)) {
        const modelNames = customType.array.map((customItem) => customItem.name.toLowerCase());
        if (modelNames.every((type) => this.standartTypesStrings.includes(type as any))) {
          let type: SchemaObjectType;
          if (modelNames.length == 1) {
            type = modelNames[0]! as any;
          } else {
            type = modelNames as any;
          }
          propertySchema.items = { type: 'array', items: { type } };
        } else {
          propertySchema.items = { type: 'array', items: [] };
          customType.array.forEach((customItem) => {
            this.checkCircularRefAndFillItems(model.name, propertySchema, customItem, 'object');
          });
        }
      } else {
        this.checkCircularRefAndFillItems(model.name, propertySchema, customType.array, 'array');
      }
    } else {
      propertySchema.items = [];
    }
  }

  protected checkCircularRefAndFillItems(
    modelName: string,
    propertySchema: SchemaObject,
    customItem: Type<AnyObj>,
    whatIs: 'array' | 'object'
  ) {
    let description = '';
    let schema: SchemaObject;
    if (this.scanInProgress.has(customItem)) {
      description = `[Circular references to ${modelName}]`;
    } else {
      this.scanInProgress.add(customItem);
      schema = this.getSchema(customItem);
    }
    if (whatIs == 'object') {
      const items = (propertySchema.items as SchemaObject).items as any[];
      if (description) {
        items.push({
          type: 'object',
          properties: {},
          description,
        });
      } else {
        items.push(schema!);
      }
    } else {
      if (description) {
        propertySchema.description = description;
        propertySchema.items = {};
      } else {
        propertySchema.items = schema!;
      }
    }
  }

  protected fillEnum(schema: SchemaObject, enumModel: AnyEnum | AnyEnum[]) {
    const enums: AnyEnum[] = Array.isArray(enumModel) ? enumModel : [enumModel];
    const typesSet = new Set<string>();
    const value: (number | string)[] = [];
    enums.forEach((enm) => {
      Object.keys(enm).forEach((key) => {
        // An enum member cannot have a numeric name
        if (isNaN(+key)) {
          value.push(enm[key]);
          typesSet.add(typeof enm[key]);
        }
      });
    });
    let type: string | string[];
    if (typesSet.size == 1) {
      type = [...typesSet][0];
    } else if (typesSet.size > 1) {
      type = [...typesSet];
    } else {
      type = 'string';
    }

    schema.type = type as SchemaObjectType;
    schema.enum = value;
  }
}

export function getContent<T extends mediaTypeName = mediaTypeName>(contentOptions?: ContentOptions<T>) {
  return new Content().get(contentOptions);
}
