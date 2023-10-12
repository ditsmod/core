import { featureModule, ModuleWithParams, optional } from '@ditsmod/core';
import { PRE_ROUTER_EXTENSIONS } from '@ditsmod/routing';

import { SessionCookie } from './session-cookie.js';
import { SessionLogMediator } from './session-log-mediator.js';
import { SessionCookieOptions } from './types.js';
import { SESSION_COOKIE_EXTENSIONS, SessionCookieExtension } from './session-cookie.extension.js';

@featureModule({
  providersPerMod: [SessionLogMediator],
  providersPerReq: [SessionCookie],
  exports: [SessionCookie],
  extensions: [
    {
      extension: SessionCookieExtension,
      groupToken: SESSION_COOKIE_EXTENSIONS,
      nextToken: PRE_ROUTER_EXTENSIONS,
      exported: true,
    },
  ],
})
export class SessionCookieModule {
  static withParams(opts: SessionCookieOptions): ModuleWithParams<SessionCookieModule> {
    return {
      module: this,
      providersPerMod: [{ token: SessionCookieOptions, useValue: opts }],
      exports: [SessionCookieOptions],
    };
  }

  constructor(log: SessionLogMediator, @optional() opts?: SessionCookieOptions) {
    if (opts?.expires && opts.maxAge) {
      log.cannotSetExpireAndMaxAge(this);
    }
  }
}
