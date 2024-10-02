import 'reflect-metadata/lite';

export { makeClassDecorator, makeParamDecorator, makePropDecorator } from './decorator-factories.js';
export * from './decorators.js';
export { ForwardRefFn, forwardRef, resolveForwardRef } from './forward-ref.js';
export { InjectionToken } from './injection-token.js';
export { Injector } from './injector.js';
export { DualKey, KeyRegistry, BeforeToken, ParamToken } from './key-registry.js';
export { reflector } from './reflection.js';
export {
  Class,
  ClassFactoryProvider,
  ClassProvider,
  DecoratorAndValue,
  DiError,
  FactoryProvider,
  FunctionFactoryProvider,
  NormalizedProvider,
  ParamsMeta,
  PropMeta,
  Provider,
  RegistryOfInjector,
  ResolvedFactory,
  ResolvedProvider,
  TokenProvider,
  TypeProvider,
  UseFactoryTuple,
  ValueProvider,
  CTX_DATA,
} from './types-and-models.js';
export {
  isClassProvider,
  isDecoratorAndValue,
  isFactoryProvider,
  isFunctionFactoryProvider,
  isMultiProvider,
  isNormalizedProvider,
  isTokenProvider,
  isTypeProvider,
  isValueProvider,
} from './utils.js';
export { DepsChecker } from './deps-checker.js';
