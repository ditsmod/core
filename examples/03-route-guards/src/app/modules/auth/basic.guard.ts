import { CanActivate, RequestContext, Status, guard } from '@ditsmod/core';

const basicAuth = process.env.BASIC_AUTH;
if (!basicAuth) {
  throw new Error('You need setup BASIC_AUTH variable in ".env" file.');
}

/**
 * See [WWW-Authenticate](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/WWW-Authenticate)
 * for more info.
 */
@guard()
export class BasicGuard implements CanActivate {
  canActivate(ctx: RequestContext, params?: any[]) {
    const { authorization } = ctx.nodeReq.headers;
    if (!authorization) {
      return this.unauth(ctx);
    }
    const expectBase64 = Buffer.from(basicAuth!, 'utf8').toString('base64');
    const [authType, actualBase64] = authorization.split(' ');
    if (authType != 'Basic' || actualBase64 != expectBase64) {
      return this.unauth(ctx);
    }
    return true;
  }

  protected unauth(ctx: RequestContext) {
    ctx.nodeRes.setHeader('WWW-Authenticate', 'Basic realm="Access to the API endpoint"');
    return Status.UNAUTHORIZED;
  }
}
