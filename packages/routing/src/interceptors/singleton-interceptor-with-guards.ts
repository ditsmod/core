import { injectable, Injector, RequestContext, CanActivate, Status, SystemLogMediator } from '@ditsmod/core';

import { RouteMeta } from '../route-data.js';
import { HttpHandler, HttpInterceptor } from './tokens-and-types.js';

@injectable()
export class SingletonInterceptorWithGuards implements ISingletonInterceptorWithGuards {
  instantiatedGuards: InstantiatedGuard[] = [];

  constructor(
    protected injector: Injector,
    protected routeMeta: RouteMeta,
  ) {
    this.initGuards();
  }

  async intercept(next: HttpHandler, ctx: RequestContext) {
    if (this.routeMeta.resolvedGuardsPerMod) {
      for (const item of this.routeMeta.resolvedGuardsPerMod) {
        const guard = item.injectorPerRou.instantiateResolved(item.guard) as CanActivate;
        const canActivate = await guard.canActivate(ctx, item.params);
        if (canActivate !== true) {
          const status = typeof canActivate == 'number' ? canActivate : undefined;
          this.prohibitActivation(ctx, status);
          return;
        }
      }
    }
    for (const item of this.instantiatedGuards) {
      const canActivate = await item.guard.canActivate(ctx, item.params);
      if (canActivate !== true) {
        const status = typeof canActivate == 'number' ? canActivate : undefined;
        this.prohibitActivation(ctx, status);
        return;
      }
    }

    return next.handle();
  }

  protected initGuards() {
    this.routeMeta.resolvedGuards!.forEach((item) => {
      const guard = this.injector.instantiateResolved(item.guard) as CanActivate;
      this.instantiatedGuards.push({ guard, params: item.params });
    });
  }

  protected prohibitActivation(ctx: RequestContext, status?: Status) {
    const systemLogMediator = this.injector.get(SystemLogMediator) as SystemLogMediator;
    systemLogMediator.youCannotActivateRoute(this, ctx.nodeReq.method!, ctx.nodeReq.url!);
    ctx.send(undefined, status || Status.UNAUTHORIZED);
  }
}

export interface ISingletonInterceptorWithGuards extends HttpInterceptor {
  instantiatedGuards: InstantiatedGuard[];
}

export interface InstantiatedGuard {
  guard: CanActivate;
  params?: any[];
}
