import { Extension, InjectionToken, MetadataPerMod2 } from '@ditsmod/core';
import { Tree } from './tree.js';

/**
 * A group of extensions that setting routes for router.
 */
export const PRE_ROUTER_EXTENSIONS = new InjectionToken<Extension<void>[]>('PRE_ROUTER_EXTENSIONS');
/**
 * A group of extensions that returns `MetadataPerMod2[]` for a router.
 */
export const ROUTES_EXTENSIONS = new InjectionToken<Extension<MetadataPerMod2>[]>('ROUTES_EXTENSIONS');

export interface ObjectAny {
  [k: string]: any;
}

export type Fn = (...args: any[]) => any;

/**
 * `http.METHODS`
 */
export type HttpMethod =
  | 'ACL'
  | 'BIND'
  | 'CHECKOUT'
  | 'CONNECT'
  | 'COPY'
  | 'DELETE'
  | 'GET'
  | 'HEAD'
  | 'LINK'
  | 'LOCK'
  | 'M-SEARCH'
  | 'MERGE'
  | 'MKACTIVITY'
  | 'MKCALENDAR'
  | 'MKCOL'
  | 'MOVE'
  | 'NOTIFY'
  | 'OPTIONS'
  | 'PATCH'
  | 'POST'
  | 'PROPFIND'
  | 'PROPPATCH'
  | 'PURGE'
  | 'PUT'
  | 'REBIND'
  | 'REPORT'
  | 'SEARCH'
  | 'SOURCE'
  | 'SUBSCRIBE'
  | 'TRACE'
  | 'UNBIND'
  | 'UNLINK'
  | 'UNLOCK'
  | 'UNSUBSCRIBE';

export type MethodTree = { [P in HttpMethod]?: Tree };

export type Args<T> = T extends (...args: infer A) => any ? A : never;

export enum RouteType {
  static = 0,
  root = 1,
  param = 2,
  catchAll = 3,
}

export class TreeConfig {
  path?: string = '';
  wildChild?: boolean = false;
  type?: number = RouteType.static;
  indices?: string = '';
  children?: any[] = [];
  handle?: Fn | null = null;
  priority?: number = 0;
}

export interface RouteParam {
  key: string;
  value: string;
}
