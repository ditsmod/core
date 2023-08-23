import { XOasObject } from '@ts-stack/openapi-spec';
import { featureModule, ModuleWithParams, PRE_ROUTER_EXTENSIONS, Providers, ROUTES_EXTENSIONS } from '@ditsmod/core';

import { OpenapiCompilerExtension } from './extensions/openapi-compiler.extension';
import { OpenapiRoutesExtension } from './extensions/openapi-routes.extension';
import { OAS_COMPILER_EXTENSIONS } from './di-tokens';
import { OpenapiController } from './openapi.controller';
import { OasConfigFiles, OasExtensionOptions } from './types/oas-extension-options';
import { OpenapiLogMediator } from './services/openapi-log-mediator';

@featureModule({
  controllers: [OpenapiController],
  providersPerApp: [OasConfigFiles],
  providersPerMod: [OpenapiLogMediator],
  extensions: [
    { extension: OpenapiRoutesExtension, groupToken: ROUTES_EXTENSIONS, exported: true },
    {
      extension: OpenapiCompilerExtension,
      groupToken: OAS_COMPILER_EXTENSIONS,
      nextToken: PRE_ROUTER_EXTENSIONS,
      exported: true,
    },
  ],
})
export class OpenapiModule {
  /**
   * @param oasObject This object used for OpenAPI per application.
   * @param path This path used for OpenAPI module with params.
   * @param swaggerOAuthOptions This options used for OpenAPI per application.
   */
  static withParams(oasObject: XOasObject<any>, path?: string) {
    const oasExtensionOptions: OasExtensionOptions = {
      oasObject,
    };

    const moduleWithParams: ModuleWithParams<OpenapiModule> = {
      module: OpenapiModule,
      providersPerApp: [...new Providers().useValue<OasExtensionOptions>(OasExtensionOptions, oasExtensionOptions)],
    };

    if (typeof path == 'string') {
      moduleWithParams.path = path;
    }

    return moduleWithParams;
  }
}
