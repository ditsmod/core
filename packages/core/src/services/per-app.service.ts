import { injectable, Injector } from '#di';
import { Provider } from '#types/mix.js';

/**
 * Used only for extensions.
 */
@injectable()
export class PerAppService {
  providers: Provider[] = [];
  #injector: Injector;

  get injector() {
    return this.reinitInjector();
  }

  /**
   * Applies providers per app to create new injector.
   */
  reinitInjector(providers?: Provider[]) {
    if (providers) {
      this.providers.push(...providers);
    }
    this.#injector = Injector.resolveAndCreate(this.providers, 'injectorPerApp');
    const child = this.#injector.createChildFromResolved([]);
    child.setParentGetter(() => this.#injector);
    return child;
  }
}
