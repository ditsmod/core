import { controller, RequestContext, route } from '@ditsmod/core';
import { Permission, requirePermissionsSngl, BearerGuard } from '#auth';

@controller({ singleton: 'module' })
export class Controller2 {
  @route('GET', 'controler2-of-module1')
  ok(ctx: RequestContext) {
    ctx.send('ok');
  }

  @route('GET', 'unauth2', [BearerGuard])
  throw401Error(ctx: RequestContext) {
    ctx.send('some secret');
  }

  @route('GET', 'forbidden2', [requirePermissionsSngl(Permission.canActivateAdministration)])
  throw403Error(ctx: RequestContext) {
    ctx.send('some secret');
  }
}
