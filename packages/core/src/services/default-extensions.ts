import { EXTENSIONS_COUNTERS, PRE_ROUTER_EXTENSIONS, ROUTES_EXTENSIONS } from '../constans';
import { PreRouterExtension } from '../extensions/pre-router.extension';
import { RoutesExtension } from '../extensions/routes.extension';
import { MetadataPerMod1 } from '../types/metadata-per-mod';
import { ExtensionProvider } from '../types/mix';
import { ExtensionsContext } from './extensions-context';
import { ExtensionsManager } from './extensions-manager';
import { PerAppService } from './per-app.service';

export const defaultExtensions: Readonly<ExtensionProvider[]> = [
  PreRouterExtension,
  RoutesExtension,
  { token: PRE_ROUTER_EXTENSIONS, useToken: PreRouterExtension, multi: true },
  { token: ROUTES_EXTENSIONS, useToken: RoutesExtension, multi: true },
];

export const defaultExtensionsTokens: Readonly<any[]> = [
  ExtensionsManager,
  ExtensionsContext,
  MetadataPerMod1,
  EXTENSIONS_COUNTERS,
  PerAppService
];
