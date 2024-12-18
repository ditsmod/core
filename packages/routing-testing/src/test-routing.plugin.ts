import { Provider, Providers } from '@ditsmod/core';
import { MetadataPerMod3, ROUTES_EXTENSIONS } from '@ditsmod/routing';
import { TestApplication, GroupMetaOverrider, TestOverrider, TestProvider } from '@ditsmod/testing';

export class TestRoutingPlugin extends TestApplication {
  overrideGroupRoutingMeta(providersToOverride: Providers | TestProvider[]) {
    const aProvidersToOverride: Provider[] = [...providersToOverride];
    const overrideRoutesMeta: GroupMetaOverrider<MetadataPerMod3> = (stage1GroupMeta) => {
      if (!aProvidersToOverride.length) {
        return;
      }
      stage1GroupMeta.groupData?.forEach((metadataPerMod3) => {
        metadataPerMod3.aControllerMetadata.forEach((controllerMetadata) => {
          aProvidersToOverride.forEach((providerToOverride) => {
            TestOverrider.overrideProvider(['Rou', 'Req'], controllerMetadata, providerToOverride);
          });
        });
      });
    };

    this.overrideDynamic(ROUTES_EXTENSIONS, overrideRoutesMeta);
    return this;
  }
}