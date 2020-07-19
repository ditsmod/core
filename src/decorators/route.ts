import { makePropDecorator, Type } from '@ts-stack/di';

import { ObjectAny } from '../types/types';
import { HttpMethod } from '../types/router';

export type RouteDecoratorFactory = (method: HttpMethod, path?: string, guards?: Type<CanActivate>[]) => RouteDecorator;

export type RouteDecorator = <T>(
  target: ObjectAny,
  propertyName: string,
  descriptor: TypedPropertyDescriptor<T>
) => RouteDecoratorMetadata;

export interface RouteDecoratorMetadata {
  [key: string]: RouteMetadata[];
}

export interface RouteMetadata {
  httpMethod: HttpMethod;
  path: string;
  guards: any[];
}
/**
 * @param guards An array of DI tokens used to look up `CanActivate()` handlers,
 * in order to determine if the current user is allowed to activate the controller.
 * By default, any user can activate.
 */
function route(httpMethod: HttpMethod, path: string = '', guards: any[] = []): RouteMetadata {
  return { httpMethod, path, guards };
}

export const Route = makePropDecorator('Route', route) as RouteDecoratorFactory;
export interface CanActivate {
  canActivate(): boolean | number | Promise<boolean | number>;
}
