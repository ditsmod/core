import { Injectable } from '@ts-stack/di';
import { edk } from '@ditsmod/core';
import { ReferenceObject, XParameterObject } from '@ts-stack/openapi-spec';

import { isOasRoute, isReferenceObject } from '../utils/type-guards';
import { OasRouteMeta } from '../types/oas-route-meta';

@Injectable()
export class OpenapiRoutesExtension extends edk.RoutesExtension implements edk.Extension<edk.RawRouteMeta[]> {
  protected getRawRoutesMeta(
    moduleName: string,
    prefixPerApp: string,
    prefixPerMod: string,
    metadataPerMod: edk.MetadataPerMod
  ) {
    const { controllersMetadata, guardsPerMod, moduleMetadata } = metadataPerMod;

    const providersPerMod = moduleMetadata.providersPerMod.slice();

    const rawRoutesMeta: edk.RawRouteMeta[] = [];
    for (const { controller, ctrlDecorValues, methods } of controllersMetadata) {
      for (const methodName in methods) {
        const methodWithDecorators = methods[methodName];
        for (const decoratorMetadata of methodWithDecorators) {
          const oasRoute = decoratorMetadata.value;
          if (!isOasRoute(oasRoute)) {
            continue;
          }
          const providersPerRou = moduleMetadata.providersPerRou.slice();
          const providersPerReq = moduleMetadata.providersPerReq.slice();
          const ctrlDecorator = ctrlDecorValues.find(edk.isController);
          const guards = [...guardsPerMod, ...this.normalizeGuards(oasRoute.guards)];
          const allProvidersPerReq = this.addProvidersPerReq(
            moduleName,
            controller,
            ctrlDecorator.providersPerReq,
            methodName,
            guards,
            providersPerReq.slice()
          );
          const { httpMethod, path: oasPath, operationObject } = oasRoute;
          const path = this.transformPath(oasPath, operationObject.parameters);
          providersPerRou.push(...(ctrlDecorator.providersPerRou || []));
          const parseBody = this.needBodyParse(providersPerMod, providersPerRou, allProvidersPerReq, httpMethod);
          const routeMeta: OasRouteMeta = {
            httpMethod,
            oasPath,
            path,
            operationObject,
            decoratorMetadata,
            controller,
            methodName,
            parseBody,
            guards,
          };
          providersPerRou.push({ provide: edk.RouteMeta, useValue: routeMeta });
          rawRoutesMeta.push({
            moduleName,
            providersPerMod,
            providersPerRou,
            providersPerReq: allProvidersPerReq,
            prefixPerApp,
            prefixPerMod,
            path,
            httpMethod,
          });
        }
      }
    }

    return rawRoutesMeta;
  }

  protected transformPath(path: string, params: (XParameterObject | ReferenceObject)[]) {
    const paramsInPath = params
      .filter((p) => !isReferenceObject(p))
      .filter((p: XParameterObject) => p.in == 'path')
      .map((p: XParameterObject) => p.name);

    paramsInPath.forEach((name) => {
      path = path.replace(`{${name}}`, `:${name}`);
    });

    return path;
  }
}
