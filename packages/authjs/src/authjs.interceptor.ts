import { RequestContext, Status, inject, injectable } from '@ditsmod/core';
import { Auth, type AuthConfig, setEnvDefaults } from '@auth/core';
import { HttpHandler, HttpInterceptor, applyHeaders, applyResponse } from '@ditsmod/routing';

import { AUTHJS_CONFIG } from '#mod/constants.js';
import { toWebRequest } from '#mod/http-api-adapters.js';

@injectable()
export class AuthjsInterceptor implements HttpInterceptor {
  constructor(@inject(AUTHJS_CONFIG) protected config: AuthConfig) {
    setEnvDefaults(process.env, this.config);
  }

  async intercept(next: HttpHandler, ctx: RequestContext) {
    const response = await Auth(toWebRequest(ctx), this.config);
    if (response.body || (response.status != Status.OK && response.status != Status.FOUND)) {
      await applyResponse(response, ctx.rawRes);
      return;
    }
    applyHeaders(response, ctx.rawRes);
    return next.handle();
  }
}