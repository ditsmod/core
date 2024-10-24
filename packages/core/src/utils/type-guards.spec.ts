import { CanActivate, Provider } from '#types/mix.js';
import { Extension } from '#types/extension-types.js';
import { injectable, InjectionToken, makePropDecorator, reflector } from '#di';
import { featureModule } from '#decorators/module.js';
import {
  isController,
  isInjectionToken,
  isFeatureModule,
  isModuleWithParams,
  isNormalizedProvider,
  isProvider,
  isRootModule,
  isRoute,
  isMultiProvider,
  MultiProvider,
  isRawRootModule,
} from './type-guards.js';
import { rootModule } from '#decorators/root-module.js';
import { controller } from '#decorators/controller.js';
import { route } from '#decorators/route.js';
import { RequestContext } from '#types/http-interceptor.js';
import { getModuleMetadata } from './get-module-metadata.js';

describe('type guards', () => {
  describe('isModule()', () => {
    it('class with decorator', () => {
      @featureModule({})
      class Module1 {}
      const metadata = reflector.getMetadata(Module1)!.constructor.decorators[0];
      expect(isFeatureModule(metadata)).toBe(true);
    });

    it('class without decorator', () => {
      class Module1 {}
      const metadata = reflector.getMetadata(Module1) as any;
      expect(isFeatureModule(metadata)).toBe(false);
    });
  });

  describe('isRootModule()', () => {
    it('class with decorator', () => {
      @rootModule({})
      class Module1 {}
      const metadata = reflector.getMetadata(Module1)!.constructor.decorators[0];
      expect(isRootModule(metadata)).toBe(true);
    });

    it('class without decorator', () => {
      class Module1 {}
      const metadata = reflector.getMetadata(Module1) as any;
      expect(isRootModule(metadata)).toBe(false);
    });
  });

  describe('isRawRootModule()', () => {
    it('class with decorator', () => {
      @rootModule({})
      class Module1 {}
      const rawMeta = getModuleMetadata(Module1)!;
      expect(isRawRootModule(rawMeta)).toBe(true);
    });

    it('class without decorator', () => {
      class Module1 {}
      const rawMeta = getModuleMetadata(Module1)!;
      expect(isRawRootModule(rawMeta)).toBe(false);
    });
  });

  describe('isController()', () => {
    it('class with decorator', () => {
      @controller()
      class Module1 {}
      const metadata = reflector.getMetadata(Module1)!.constructor.decorators[0];
      expect(isController(metadata)).toBe(true);
    });

    it('class without decorator', () => {
      class Module1 {}
      const metadata = reflector.getMetadata(Module1);
      expect(isController(metadata)).toBe(false);
    });
  });

  describe('isRoute()', () => {
    @injectable()
    class Guard1 implements CanActivate {
      canActivate(ctx: RequestContext) {
        return true;
      }

      other() {}
    }

    @controller()
    class ClassWithDecorators {
      @route('GET', '', [Guard1])
      some() {}
    }

    it('should recognize the route', () => {
      const firstDecor = reflector.getMetadata(ClassWithDecorators)!.some.decorators[0];
      expect(isRoute({ decorator: firstDecor.decorator, value: firstDecor.value })).toBe(true);
    });
  });

  describe('isModuleWithParams', () => {
    it('module without params', () => {
      @featureModule({})
      class Module1 {}

      expect(isModuleWithParams(Module1)).toBe(false);
    });

    it('module with params', () => {
      @featureModule({})
      class Module1 {
        static withParams() {
          return {
            module: Module1,
            other: 123,
          };
        }
      }

      const modObj = Module1.withParams();
      expect(isModuleWithParams(modObj)).toBe(true);
    });
  });

  describe('isProvider()', () => {
    it('should filtered all types of providers', () => {
      @featureModule({})
      class Module1 {}
      @rootModule({})
      class Module2 {}

      expect(isProvider(class {})).toBe(true);
      expect(isProvider({ token: '', useValue: '' })).toBe(true);
      expect(isProvider(Module1)).toBe(false);
      expect(isProvider(Module2)).toBe(false);
      expect(isProvider(5 as any)).toBe(false);
    });
  });

  describe('isNormalizedProvider()', () => {
    it('should recognize all types of providers', () => {
      const providers: Provider[] = [
        { token: '', useValue: '' },
        { token: '', useClass: class {} },
        { token: '', useToken: class {} },
        { token: '', useFactory: class {} as any },
      ];
      expect(providers.every(isNormalizedProvider)).toBe(true);
    });

    it('should fail class types of providers', () => {
      const providers: Provider[] = [class {}];
      expect(providers.every(isNormalizedProvider)).toBe(false);
    });

    it('should fail check number', () => {
      const providers: Provider[] = [5 as any];
      expect(providers.every(isNormalizedProvider)).toBe(false);
    });
  });
  describe('isInjectionToken()', () => {
    const token1 = new InjectionToken('token1');
    const token2 = {};
    class token3 implements Extension {
      async init() {}
    }

    it('should recognize the InjectionToken', () => {
      expect(isInjectionToken(token1)).toBe(true);
      expect(isInjectionToken(token2)).toBe(false);
      expect(isInjectionToken(token3)).toBe(false);
    });
  });

  describe('isMultiProvider()', () => {
    it('true ValueProvider', () => {
      const provider: MultiProvider = { token: 'token', useValue: 'fake', multi: true };
      expect(isMultiProvider(provider)).toBe(true);
    });

    it('true ClassProvider', () => {
      const provider: MultiProvider = { token: 'token', useClass: class {}, multi: true };
      expect(isMultiProvider(provider)).toBe(true);
    });

    it('true TokenProvider', () => {
      const provider: MultiProvider = { token: 'token', useToken: class {}, multi: true };
      expect(isMultiProvider(provider)).toBe(true);
    });

    it('true FactoryProvider', () => {
      const factory = makePropDecorator();
      class ClassWithDecorators {
        @factory()
        method1() {
          return '';
        }
      }
      const provider: MultiProvider = {
        token: 'token',
        useFactory: [ClassWithDecorators, ClassWithDecorators.prototype.method1],
        multi: true,
      };
      expect(isMultiProvider(provider)).toBe(true);
    });

    it('false ValueProvider', () => {
      const provider: Provider = { token: 'token', useValue: 'fake' };
      expect(isMultiProvider(provider)).toBe(false);
    });

    it('false ClassProvider', () => {
      const provider: Provider = { token: 'token', useClass: class {} };
      expect(isMultiProvider(provider)).toBe(false);
    });

    it('false TokenProvider', () => {
      const provider: Provider = { token: 'token', useToken: class {} };
      expect(isMultiProvider(provider)).toBe(false);
    });

    it('false FactoryProvider', () => {
      const factory = makePropDecorator();
      class ClassWithDecorators {
        @factory()
        method1() {
          return '';
        }
      }
      const provider: Provider = {
        token: 'token',
        useFactory: [ClassWithDecorators, ClassWithDecorators.prototype.method1],
      };
      expect(isMultiProvider(provider)).toBe(false);
    });
  });
});
