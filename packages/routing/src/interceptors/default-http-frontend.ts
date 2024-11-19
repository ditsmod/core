import { parse } from 'querystring';
import { AnyObj, injectable, Injector, PATH_PARAMS, QUERY_PARAMS, RequestContext } from '@ditsmod/core';

import { HttpFrontend, HttpHandler } from './tokens-and-types.js';

@injectable()
export class DefaultHttpFrontend implements HttpFrontend {
  constructor(private injector: Injector) {}

  async intercept(next: HttpHandler, ctx: RequestContext) {
    if (ctx.queryString) {
      this.injector.setByToken(QUERY_PARAMS, parse(ctx.queryString));
    }
    if (ctx.aPathParams?.length) {
      const pathParams: AnyObj = {};
      ctx.aPathParams.forEach((param) => (pathParams[param.key] = param.value));
      this.injector.setByToken(PATH_PARAMS, pathParams);
    }
    return next.handle();
  }
}