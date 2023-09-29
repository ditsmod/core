import { injectable } from '#di';
import { HttpBackend, SingletonRequestContext } from '#types/http-interceptor.js';
import { RouteMeta } from '#types/route-data.js';

@injectable()
export class SingletonHttpBackend implements HttpBackend {
  ctx: SingletonRequestContext;

  constructor(protected routeMeta: RouteMeta) {}

  handle() {
    return this.routeMeta.routeHandler!(this.ctx);
  }
}
