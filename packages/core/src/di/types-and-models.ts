import { AnyFn } from '#types/mix.js';
import type { fromSelf, skipSelf } from './decorators.js';
import { InjectionToken } from './injection-token.js';
import { DualKey } from './key-registry.js';

/**
 * Any error generated by di is an instance of this error.
 * So you can use it for error handling.
 */
export class DiError extends Error {}
/**
 * ### Interface Overview
 *
```ts
interface Class<T> extends Function {
  new (...args: any[]): T
}
```
 * Represents a type that a some class is instances of.
 *
 * An example of a `Class` is class, which in JavaScript is be represented by
 * the constructor function.
 */
export const Class = Function;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface Class<T = any> extends Function {
  new (...args: any[]): T;
}

export type PropMetadataTuple<Value = any> = [Class, ...DecoratorAndValue<Value>[]];

/**
 * Metadata returned by the `reflector.getPropMetadata()` method.
 */
export type PropMeta<Proto extends object = object> = {
  [P in keyof Proto]: PropMetadataTuple;
};

/**
 * Metadata returned by the `reflector.getPropMetadata()` method.
 */
export type PropMetaNew<Proto extends object = object> = {
  [P in (keyof Proto | 'constructor')]: PropProto;
};

export interface PropProto {
  type: Class;
  decorators: DecoratorAndValue[];
  params: PropMetadataTuple[];
}

export type ParamsItem<Value = any> = DecoratorAndValue<Value> | InjectionToken<any> | Class;

/**
 * Metadata returned by the `reflector.getParamsMetadata()` method.
 */
export type ParamsMeta<Value = any> = [Class, ...ParamsItem<Value>[]] | [];

/**
 * This class is uses to identifying metadata that is generated by a particular decorator.
 */
export class DecoratorAndValue<Value = any> {
  /**
   * @param decorator The decorator factory function.
   */
  constructor(
    public decorator: (...args: any[]) => any,
    public value: Value,
    /**
     * The directory in which the class was declared.
     */
    public declaredInDir?: string,
  ) {}
}

export type Visibility = typeof fromSelf | typeof skipSelf | null;

export type NormalizedProvider = ValueProvider | ClassProvider | TokenProvider | FactoryProvider;

export const CTX_DATA = new InjectionToken('CTX_DATA');

/**
 * This is internal and should not be used directly.
 */
export class Dependency {
  constructor(
    public dualKey: DualKey,
    public optional: boolean,
    public visibility: Visibility,
    public ctx?: NonNullable<unknown>,
  ) {}

  static fromDualKey(dualKey: DualKey, ctx?: NonNullable<unknown>): Dependency {
    return new Dependency(dualKey, false, null, ctx);
  }
}

/**
 * This ID is used (instead `instanceof ResolvedProvider`) to quickly identify the type of values that the DI registry contains.
 *
 */
export const ID = Symbol();

/**
 * An internal resolved representation of a `Provider` used by the `Injector`.
 *
 * It is usually created automatically by `Injector.resolveAndCreate`.
 *
 * It can be created manually, as follows:
 *
 * ### Example
 *
```ts
let resolvedProviders = Injector.resolve([{ token: 'message', useValue: 'Hello' }]);
let injector = Injector.fromResolvedProviders(resolvedProviders);

expect(injector.get('message')).toEqual('Hello');
```
 * 
 */
export class ResolvedProvider {
  [ID] = true;
  constructor(
    public dualKey: DualKey,
    public resolvedFactories: ResolvedFactory[],
    public multi: boolean,
  ) {}
}

export class RegistryOfInjector {
  [id: number]: ResolvedProvider;
}

/**
 * Returns new class with `RegistryOfInjector` interface.
 */
export function getNewRegistry(): typeof RegistryOfInjector {
  return class NewRegistryOfInjector {
    /**
     * This ID taken from `resolvedProvider.dualKey.id`.
     */
    [id: number]: ResolvedProvider;
  };
}

/**
 * An internal resolved representation of a factory function created by resolving `Provider`.
 */
export class ResolvedFactory {
  constructor(
    /**
     * Factory function which can return an instance of an object represented by a key.
     */
    public factory: AnyFn,

    /**
     * Arguments (dependencies) to the `factory` function.
     */
    public dependencies: Dependency[],
  ) {}
}

/**
 * ### Interface Overview
 *
```ts
interface TypeProvider extends Class {
}
```
 *
 * Configures the `Injector` to return an instance of `Class` when `Class` is used  as token.
 *
 * ### Example
 *
```ts
@injectable()
class MyService {}

const provider: TypeProvider = MyService;
```
 *
 * ### Description
 *
 * Create an instance by invoking the `new` operator and supplying additional arguments.
 * This form is a short form of `TypeProvider`;
 *
 * ### Example
 *
```ts
@injectable()
class Greeting {
  salutation = 'Hello';
}

const injector = Injector.resolveAndCreate([
  Greeting,  // Shorthand for { token: Greeting, useClass: Greeting }
]);

expect(injector.get(Greeting).salutation).toBe('Hello');
```
 */
export interface TypeProvider extends Class {}

export interface BaseNormalizedProvider {
  /**
   * An injection token. (Typically an instance of `Class` or `InjectionToken`, but can be `any`).
   */
  token?: any;

  /**
   * If true, then injector returns an array of instances. This is useful to allow multiple
   * providers spread across many files to token configuration information to a common token.
   *
   * ### Example
   *
```ts
const injector = Injector.resolveAndCreate([
  {token: 'local', multi: true, useValue: 'en'},
  {token: 'local', multi: true, useValue: 'sk'},
]);

const locales: string[] = injector.get('local');
expect(locales).toEqual(['en', 'sk']);
```
   */
  multi?: boolean;
}

/**
 * ### Interface Overview
 *
```ts
interface ValueProvider {
  token: NonNullable<unknown>
  useValue: any
  multi?: boolean
}
```
 * Configures the `Injector` to return a value for a token.
 *
 * ### How To Use
 *
```ts
const provider: ValueProvider = {token: 'someToken', useValue: 'someValue'};
```
 *
 *
 * ### Example
 *
```ts
const injector =
    Injector.resolveAndCreate([{token: String, useValue: 'Hello'}]);

expect(injector.get(String)).toEqual('Hello');
```
 */
export interface ValueProvider<T = any> extends BaseNormalizedProvider {
  token: NonNullable<unknown>;
  /**
   * The value to inject.
   */
  useValue: T;
}

/**
 * ### Interface Overview
 *
```ts
interface ClassProvider {
  token: NonNullable<unknown>
  useClass: Class
  multi?: boolean
}
```
 * Configures the `Injector` to return an instance of `useClass` for a token.
 *
 * ### Example
 *
```ts
@injectable()
class MyService {}

const provider: ClassProvider = {token: 'someToken', useClass: MyService};
```
 *
 *
 * ### Example
 *
```ts
abstract class Shape { name: string; }

class Square extends Shape {
  name = 'square';
}

const injector = Injector.resolveAndCreate([{token: Shape, useClass: Square}]);

const shape: Shape = injector.get(Shape);
expect(shape.name).toEqual('square');
expect(shape instanceof Square).toBe(true);
```
 *
 * Note that following two providers are not equal:
 *
```ts
class Greeting {
  salutation = 'Hello';
}

class FormalGreeting extends Greeting {
  salutation = 'Greetings';
}

const injector = Injector.resolveAndCreate(
    [FormalGreeting, {token: Greeting, useClass: FormalGreeting}]);

// The injector returns different instances.
// See: {token: ?, useToken: ?} if you want the same instance.
expect(injector.get(FormalGreeting)).not.toBe(injector.get(Greeting));
```
 */
export interface ClassProvider extends BaseNormalizedProvider {
  token: NonNullable<unknown>;

  /**
   * Class to instantiate for the `token`.
   */
  useClass: Class;
}

/**
 * ### Interface Overview
 *
```ts
interface TokenProvider {
  token: NonNullable<unknown>
  useToken: any
  multi?: boolean
}
```
 * Configures the `Injector` to return a value of another `useToken` token.
 *
 * ### Example
 *
```ts
const provider: TokenProvider = {token: 'someToken', useToken: 'someOtherToken'};
```
 *
 *
 * ### Example
 *
```ts
class Greeting {
  salutation = 'Hello';
}

class FormalGreeting extends Greeting {
  salutation = 'Greetings';
}

const injector = Injector.resolveAndCreate(
    [FormalGreeting, {token: Greeting, useToken: FormalGreeting}]);

expect(injector.get(Greeting).salutation).toEqual('Greetings');
expect(injector.get(FormalGreeting).salutation).toEqual('Greetings');
expect(injector.get(FormalGreeting)).toBe(injector.get(Greeting));
```
 */
export interface TokenProvider extends BaseNormalizedProvider {
  token: NonNullable<unknown>;

  /**
   * Pointing to other `token` to return its value. Equivalent to `injector.get(useToken)`.
   */
  useToken: any;
}

/**
 * Configures the `Injector` to return a value by invoking a class method.
 *
 * ### Example
 *
```ts
import { methodFactory } from '#di';

const Location = new InjectionToken('location');
const Hash = new InjectionToken('hash');

export class ClassWithFactory {
  @methodFactory()
  method1(@optional() location: Location) {
    return `Hash for: ${location}`;
  }
}

const injector = Injector.resolveAndCreate([
  { token: Hash, useFactory: [ClassWithFactory, ClassWithFactory.prototype.method1]
}]);

expect(injector.get(Hash)).toEqual('Hash for: null');
```
 */
export type FactoryProvider = FunctionFactoryProvider | ClassFactoryProvider;

export interface FunctionFactoryProvider extends BaseNormalizedProvider {
  /**
   * A function to invoke to create a value for this `token`.
   * The function is invoked with resolved values of `token`s in the `deps` field.
   */
  useFactory: AnyFn;
  deps?: any[];
}

export interface ClassFactoryProvider extends BaseNormalizedProvider {
  /**
   * The tuple, where the class comes first, and the method of this class comes second:
   * `useFactory: [Class, Class.prototype.someMethod]`.
   *
   * The method uses to invoke to create a value for `token`. The method is invoked with
   * resolved values of its parameters.
   */
  useFactory: UseFactoryTuple;
  deps?: never;
}

export type UseFactoryTuple = [Class, AnyFn];

/**
 * Describes how the `Injector` should be configured.
 *
 * ### How To Use
 * See `TypeProvider`, `ValueProvider`, `ClassProvider`, `TokenProvider`, `FactoryProvider`.
 *
 */
export type Provider = TypeProvider | ValueProvider | ClassProvider | TokenProvider | FactoryProvider;
