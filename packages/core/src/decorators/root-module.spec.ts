import { reflector } from '#di';
import { rootModule } from './root-module.js';

describe('RootModule decorator', () => {
  it('empty decorator', () => {
    @rootModule({})
    class Module1 {}

    const metadata = reflector.getDecorators(Module1)!;
    expect(metadata.length).toBe(1);
    expect(metadata[0].value).toEqual({
      guards: [],
      decorator: rootModule,
      declaredInDir: expect.stringContaining('decorators'),
    });
    expect(metadata[0].decorator).toBe(rootModule);
  });

  it('decorator with some data', () => {
    @rootModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getDecorators(Module1)!;
    expect(metadata.length).toBe(1);
    expect(metadata[0].value).toEqual({
      controllers: [],
      guards: [],
      decorator: rootModule,
      declaredInDir: expect.stringContaining('decorators'),
    });
  });

  it('multi decorator with some data', () => {
    @rootModule({ providersPerApp: [] })
    @rootModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getDecorators(Module1)!;
    expect(metadata.length).toBe(2);
    expect(metadata[0].value).toEqual({
      controllers: [],
      guards: [],
      decorator: rootModule,
      declaredInDir: expect.stringContaining('decorators'),
    });

    expect(metadata[1].value).toEqual({
      providersPerApp: [],
      guards: [],
      decorator: rootModule,
      declaredInDir: expect.stringContaining('decorators'),
    });
  });

  it('decorator with all allowed properties', () => {
    @rootModule({
      imports: [],
      providersPerApp: [],
      providersPerMod: [],
      providersPerReq: [],
      controllers: [],
      exports: [],
      extensions: [],
    })
    class Module1 {}

    const metadata = reflector.getDecorators(Module1)!;
    expect(metadata.length).toBe(1);
    expect(metadata[0].value).toEqual({
      imports: [],
      providersPerApp: [],
      providersPerMod: [],
      providersPerReq: [],
      controllers: [],
      exports: [],
      extensions: [],
      guards: [],
      decorator: rootModule,
      declaredInDir: expect.stringContaining('decorators'),
    });
  });
});
