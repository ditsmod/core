import { Auth, createActionURL, setEnvDefaults } from '@auth/core';
import type { AuthConfig } from '@auth/core/types';

import { GetSessionResult, ReqForSession } from './types.js';

export async function getSession(req: ReqForSession, config: AuthConfig): GetSessionResult {
  setEnvDefaults(process.env, config);
  const url = createActionURL(
    'session',
    req.protocol,
    new Headers(req.rawReq.headers as HeadersInit),
    process.env,
    config,
  );

  const request = new Request(url, { headers: { cookie: req.rawReq.headers.cookie ?? '' } });
  const response = await Auth(request, config);
  const { status = 200 } = response;
  const data = await response.json();

  if (!data || !Object.keys(data).length) {
    return null;
  }
  if (status == 200) {
    return data;
  }
  throw new Error(data.message);
}
