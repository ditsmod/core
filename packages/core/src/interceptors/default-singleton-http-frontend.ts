import { parse } from 'node:querystring';

import { injectable } from '#di';
import { HttpFrontend, HttpHandler } from '#interceptors/tokens-and-types.js';
import { SingletonRequestContext } from '#core/request-context.js';
import { AnyObj } from '#types/mix.js';

@injectable()
export class DefaultSingletonHttpFrontend implements HttpFrontend {
  async intercept(next: HttpHandler, ctx: SingletonRequestContext) {
    if (ctx.queryString) {
      ctx.queryParams = parse(ctx.queryString);
    }
    if (ctx.aPathParams?.length) {
      const pathParams: AnyObj = {};
      ctx.aPathParams.forEach((param) => (pathParams[param.key] = param.value));
      ctx.pathParams = pathParams;
    }
    return next.handle();
  }
}
