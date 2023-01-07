import { injectable, optional, RequestContext } from '@ditsmod/core';
import { Cookies, CookieOptions } from '@ts-stack/cookies';
import { CorsOptions, cors, mergeOptions } from '@ts-stack/cors';

@injectable()
export class CorsService {
  constructor(@optional() private corsOptions?: CorsOptions) {}

  setCookie(ctx: RequestContext, name: string, value?: any, opts?: CookieOptions) {
    const cookies = new Cookies(ctx.nodeReq, ctx.nodeRes);
    cookies.set(name, value, opts);
    const clonedCorsOptions = { ...(this.corsOptions || {}) };
    clonedCorsOptions.allowCredentials = true;
    cors(ctx.nodeReq, ctx.nodeRes, mergeOptions(clonedCorsOptions));
  }
}
