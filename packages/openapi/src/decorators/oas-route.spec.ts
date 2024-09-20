import { PropMeta, reflector, controller, CanActivate, RequestContext } from '@ditsmod/core';
import { oasRoute } from './oas-route.js';

// console.log(inspect(actualMeta, false, 5));

describe('@oasRoute', () => {
  it('controller without methods', () => {
    @controller()
    class Controller1 {}

    expect(reflector.getPropMetadata(Controller1)).toEqual({});
  });

  it('one method, without operation object', () => {
    @controller()
    class Controller1 {
      @oasRoute('GET')
      method() {}
    }

    const actualMeta = reflector.getPropMetadata(Controller1);
    const expectedMeta = {
      method: [
        Function,
        {
          decorator: oasRoute,
          value: { httpMethod: 'GET', path: undefined },
        },
      ],
    };
    expect(actualMeta).toEqual(expectedMeta);
  });

  it('one method, with operation object', () => {
    class Guard implements CanActivate {
      canActivate(ctx: RequestContext) {
        return true;
      }
    }
    @controller()
    class Controller1 {
      @oasRoute('GET', 'posts', [Guard], { operationId: 'someId' })
      method() {}
    }

    const actualMeta = reflector.getPropMetadata(Controller1);
    const expectedMeta = {
      method: [
        Function,
        {
          decorator: oasRoute,
          value: { httpMethod: 'GET', path: 'posts', guards: [Guard], operationObject: { operationId: 'someId' } },
        },
      ],
    };
    expect(actualMeta).toEqual(expectedMeta);
  });

  it('route with operationObject as third argument', () => {
    @controller()
    class Controller1 {
      @oasRoute('GET', 'path', { operationId: 'someId' })
      method() {}
    }

    const actualMeta = reflector.getPropMetadata(Controller1);
    const expectedMeta: PropMeta<Controller1> = {
      method: [
        Function,
        {
          decorator: oasRoute,
          value: { httpMethod: 'GET', path: 'path', operationObject: { operationId: 'someId' } },
        },
      ],
    };

    expect(actualMeta).toEqual(expectedMeta);
  });
});
