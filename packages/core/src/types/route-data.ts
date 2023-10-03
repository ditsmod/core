import { Class, FactoryProvider, Injector, ResolvedProvider } from '#di';
import { SingletonRequestContext } from './http-interceptor.js';
import { DecoratorMetadata, HttpMethod, NormalizedGuard, ResolvedGuard } from './mix.js';
import { RouteHandler } from './router.js';

/**
 * This metadata is generated by `ROUTES_EXTENSIONS` group, and available via DI.
 */
export class RouteMeta {
  /**
   * Useful to set `routeMeta.ResolvedProvider`.
   */
  static resolveHandler(controller: Class, propertyKey: string | symbol) {
    const factoryProvider: FactoryProvider = { useFactory: [controller, controller.prototype[propertyKey]] };
    return Injector.resolve([factoryProvider])[0];
  }

  static resolveGuards(guards: NormalizedGuard[]): ResolvedGuard[] {
    return guards.map((g) => {
      return { guard: Injector.resolve([g.guard])[0], params: g.params };
    });
  }

  /**
   * A resolved provider that is assigned to call a method of a controller that is bound to a specific route.
   */
  resolvedHandler?: ResolvedProvider;
  /**
   * An array of DI tokens used to look up `CanActivate()` handlers,
   * in order to determine if the current user is allowed to activate the controller.
   * By default, any user can activate.
   */
  resolvedGuards: ResolvedGuard[];
  /**
   * Route decorator has value of the decorator and ref to other decorators
   * on the same controller's method.
   */
  decoratorMetadata: DecoratorMetadata;
  controller: Class;
  methodName: string | symbol;
  routeHandler?: (ctx: SingletonRequestContext) => any;
}

/**
 * This metadata is generated by PreRouterExtension as internal type that need only for it.
 */
export interface PreparedRouteMeta {
  moduleName: string;
  httpMethod: HttpMethod;
  path: string;
  handle: RouteHandler;
}
