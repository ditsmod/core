import { reflector } from '../di';

import { featureModule } from './module';

describe('Module decorator', () => {
  it('empty decorator', () => {
    @featureModule({})
    class Module1 {}

    const metadata = reflector.getClassMetadata<{}>(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].decorator).toBe(featureModule);
    expect(metadata[0].value).toEqual({});
  });

  it('decorator with some data', () => {
    @featureModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getClassMetadata(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].value).toEqual({ controllers: [] });
  });

  it('multi decorator with some data', () => {
    @featureModule({ providersPerApp: [] })
    @featureModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getClassMetadata(Module1);
    expect(metadata.length).toBe(2);
    expect(metadata[0].value).toEqual({ controllers: [] });
    expect(metadata[1].value).toEqual({ providersPerApp: [] });
  });

  it('decorator with all allowed properties', () => {
    @featureModule({
      imports: [],
      providersPerApp: [],
      providersPerMod: [],
      providersPerReq: [],
      controllers: [],
      exports: [],
      extensions: [],
    })
    class Module1 {}

    const metadata = reflector.getClassMetadata(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].value).toEqual({
      imports: [],
      providersPerApp: [],
      providersPerMod: [],
      providersPerReq: [],
      controllers: [],
      exports: [],
      extensions: [],
    });
  });
});
