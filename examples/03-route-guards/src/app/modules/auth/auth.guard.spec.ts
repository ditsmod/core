import { RequestContext } from '@ditsmod/core';

import { AuthGuard } from './auth.guard.js';

describe('AuthGuard#canActivate()', () => {
  const authGuard = new AuthGuard();
  function getCtx(authorization: string) {
    return { nodeReq: { headers: { authorization } } } as RequestContext;
  }

  it('should return false', async () => {
    const ctx = getCtx('');
    await expect(authGuard.canActivate(ctx)).resolves.not.toThrow();
    await expect(authGuard.canActivate(ctx)).resolves.toBe(false);
  });

  it('should return true', async () => {
    const ctx = getCtx('Token fake-toke-here');
    await expect(authGuard.canActivate(ctx)).resolves.not.toThrow();
    await expect(authGuard.canActivate(ctx)).resolves.toBe(true);
  });
});
