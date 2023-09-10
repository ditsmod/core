import { reflector } from '#di';
import { ModuleMetadataValue } from '#utils/get-module-metadata.js';
import { featureModule } from './module.js';

describe('Module decorator', () => {
  it('empty decorator', () => {
    @featureModule({})
    class Module1 {}

    const metadata = reflector.getClassMetadata<ModuleMetadataValue>(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].decorator).toBe(featureModule);
    expect(metadata[0].value.data).toEqual({});
    expect(metadata[0].value.declaredInDir).toContain('packages/core/dist/decorators');
  });

  it('decorator with some data', () => {
    @featureModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getClassMetadata<ModuleMetadataValue>(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].value.data).toEqual({ controllers: [] });
    expect(metadata[0].value.declaredInDir).toContain('packages/core/dist/decorators');
  });

  it('multi decorator with some data', () => {
    @featureModule({ providersPerApp: [] })
    @featureModule({ controllers: [] })
    class Module1 {}

    const metadata = reflector.getClassMetadata<ModuleMetadataValue>(Module1);
    expect(metadata.length).toBe(2);
    expect(metadata[0].value.data).toEqual({ controllers: [] });
    expect(metadata[1].value.data).toEqual({ providersPerApp: [] });
    expect(metadata[0].value.declaredInDir).toContain('packages/core/dist/decorators');
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

    const metadata = reflector.getClassMetadata<ModuleMetadataValue>(Module1);
    expect(metadata.length).toBe(1);
    expect(metadata[0].value.data).toEqual({
      imports: [],
      providersPerApp: [],
      providersPerMod: [],
      providersPerReq: [],
      controllers: [],
      exports: [],
      extensions: [],
    });
    expect(metadata[0].value.declaredInDir).toContain('packages/core/dist/decorators');
  });
});
