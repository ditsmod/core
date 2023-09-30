import {
  Extension,
  ExtensionsManager,
  HTTP_INTERCEPTORS,
  PerAppService,
  injectable,
  InjectionToken,
} from '@ditsmod/core';
import { ROUTES_EXTENSIONS } from '@ditsmod/routing';

import { BodyParserConfig } from './body-parser-config.js';
import { BodyParserInterceptor } from './body-parser.interceptor.js';
import { SingletonBodyParserInterceptor } from './singleton-body-parser.interceptor.js';

export const BODY_PARSER_EXTENSIONS = new InjectionToken<Extension<void>[]>('BODY_PARSER_EXTENSIONS');

@injectable()
export class BodyParserExtension implements Extension<void> {
  private inited: boolean;

  constructor(
    protected extensionManager: ExtensionsManager,
    protected perAppService: PerAppService,
  ) {}

  async init() {
    if (this.inited) {
      return;
    }

    const aMetadataPerMod2 = await this.extensionManager.init(ROUTES_EXTENSIONS);
    aMetadataPerMod2.forEach((metadataPerMod2) => {
      const { aControllersMetadata2, providersPerMod } = metadataPerMod2;
      aControllersMetadata2.forEach(({ providersPerRou, providersPerReq, httpMethod, isSingleton }) => {
        // Merging the providers from a module and a controller
        const mergedProvidersPerRou = [...metadataPerMod2.providersPerRou, ...providersPerRou];
        const mergedProvidersPerReq = [...metadataPerMod2.providersPerReq, ...providersPerReq];

        // Creating a hierarchy of injectors.
        const injectorPerApp = this.perAppService.injector;
        const injectorPerMod = injectorPerApp.resolveAndCreateChild(providersPerMod);
        const injectorPerRou = injectorPerMod.resolveAndCreateChild(mergedProvidersPerRou);
        if (isSingleton) {
          let bodyParserConfig = injectorPerRou.get(BodyParserConfig, undefined, {}) as BodyParserConfig;
          bodyParserConfig = { ...new BodyParserConfig(), ...bodyParserConfig }; // Merge with default.
          if (bodyParserConfig.acceptMethods!.includes(httpMethod)) {
            providersPerRou.push({ token: HTTP_INTERCEPTORS, useClass: SingletonBodyParserInterceptor, multi: true });
          }
        } else {
          const injectorPerReq = injectorPerRou.resolveAndCreateChild(mergedProvidersPerReq);
          let bodyParserConfig = injectorPerReq.get(BodyParserConfig, undefined, {}) as BodyParserConfig;
          bodyParserConfig = { ...new BodyParserConfig(), ...bodyParserConfig }; // Merge with default.
          if (bodyParserConfig.acceptMethods!.includes(httpMethod)) {
            providersPerReq.push({ token: HTTP_INTERCEPTORS, useClass: BodyParserInterceptor, multi: true });
          }
        }
      });
    });

    this.inited = true;
  }
}
