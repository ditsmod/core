import { XOasObject } from '@ts-stack/openapi-spec';
import { featureModule, ModuleWithParams, Providers } from '@ditsmod/core';
import { RoutingModule, PRE_ROUTER_EXTENSIONS, ROUTES_EXTENSIONS } from '@ditsmod/routing';

import { OpenapiCompilerExtension } from './extensions/openapi-compiler.extension.js';
import { OpenapiRoutesExtension } from './extensions/openapi-routes.extension.js';
import { OAS_COMPILER_EXTENSIONS } from './di-tokens.js';
import { OpenapiController } from './openapi.controller.js';
import { SwaggerOAuthOptions } from './swagger-ui/o-auth-options.js';
import { OasConfigFiles, OasExtensionOptions } from './types/oas-extension-options.js';
import { OpenapiLogMediator } from './services/openapi-log-mediator.js';
import { OpenapiErrorMediator } from './services/openapi-error-mediator.js';

@featureModule({
  imports: [RoutingModule],
  controllers: [OpenapiController],
  providersPerApp: [OasConfigFiles],
  providersPerMod: [OpenapiLogMediator, OpenapiErrorMediator],
  extensions: [
    { extension: OpenapiRoutesExtension, group: ROUTES_EXTENSIONS, exported: true },
    {
      extension: OpenapiCompilerExtension,
      group: OAS_COMPILER_EXTENSIONS,
      beforeGroup: PRE_ROUTER_EXTENSIONS,
      exported: true,
    },
  ],
  exports: [RoutingModule],
})
export class OpenapiModule {
  static module = OpenapiModule;
  static absolutePath = '';
  /**
   * @param oasObject This object used for OpenAPI per application.
   * @param absolutePath This absolute path used for OpenAPI module with params.
   */
  static withParams(oasObject: XOasObject<any>, absolutePath?: string, swaggerOAuthOptions?: SwaggerOAuthOptions) {
    const oasExtensionOptions: OasExtensionOptions = {
      oasObject,
      swaggerOAuthOptions,
    };

    const moduleWithParams: ModuleWithParams<OpenapiModule> = {
      module: this,
      providersPerApp: new Providers().useValue<OasExtensionOptions>(OasExtensionOptions, oasExtensionOptions),
    };

    if (typeof absolutePath == 'string') {
      moduleWithParams.absolutePath = absolutePath;
    }

    return moduleWithParams;
  }
}
