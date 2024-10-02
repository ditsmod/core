<a name="core-2.59.0"></a>
# [core-2.59.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.59.0) (2024-10-02)

| Commit | Type | Description |
| -- | -- | -- |
| [f63a4fca5...3d8aeb49](https://github.com/ditsmod/ditsmod/compare/f63a4fca5...3d8aeb49) | feat | allow passing context data as second argument for `@inject(token, ctx)` |
| [20f39fe4c3](https://github.com/ditsmod/ditsmod/commit/20f39fe4c31fec) | refactor | replaced `token: any` by `token: NonNullable<unknown>` for Injector. |
| [c0c36cb380](https://github.com/ditsmod/ditsmod/commit/c0c36cb3805659) | fix | fixed error handling before the app is initialized. |

<a name="core-2.58.1"></a>
## [core-2.58.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.58.1) (2024-09-30)

| Commit | Type | Description |
| -- | -- | -- |
| [03d83fcf4c](https://github.com/ditsmod/ditsmod/commit/03d83fcf4c0ffcd7) | fix | fixed adding guards per a module. |

<a name="core-2.58.0"></a>
## [core-2.58.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.58.0) (2024-09-29)

**Breaking changes**

- renamed `res.setHeaders()` to `res.setHeader()`;
- removed `res.sendText()`;
- remove `isSingleton` for gurads;
- removed `headers` parameter from `res.send()` and `res.sendJson()`.

**Other changes**

| Commit | Type | Description |
| -- | -- | -- |
| [e66c7d8942](https://github.com/ditsmod/ditsmod/commit/e66c7d8942f408aa) | feat | added DI token `SERVER`. |
| [11c2f06bd8](https://github.com/ditsmod/ditsmod/commit/11c2f06bd8542da8) | feat | added support for `HEAD` method. |
| [64c55ea8b6](https://github.com/ditsmod/ditsmod/commit/64c55ea8b6564cff) | fix | fixed settings guards per a module. |

<a name="core-2.57.0"></a>
## [core-2.57.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.57.0) (2024-09-22)

| Commit | Type | Description |
| -- | -- | -- |
| [79d0fbb92e](https://github.com/ditsmod/ditsmod/commit/79d0fbb92e0a2) | feat | introduced `absolutePath` for `ModuleWithParams` and `AppendsWithParams`. |

<a name="core-2.56.1"></a>
## [core-2.56.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.56.1) (2024-09-20)

| Commit | Type | Description |
| -- | -- | -- |
| [c9c1c14b40](https://github.com/ditsmod/ditsmod/commit/c9c1c14b40b2c0c) | fix |fixed passing error messages to `SystemLogMediator`. |

<a name="core-2.56.0"></a>
## [core-2.56.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.56.0) (2024-09-05)

**Breaking Changes**

- [renamed](https://github.com/ditsmod/ditsmod/commit/00f56e2b481) `groupToken` to `token` for `ExtensionOptionsBase`.
- now from `extensionManager.init()` returns `TotalInitMeta`:

```ts
interface TotalInitMeta<T = any> {
  delay: boolean;
  countdown = 0;
  totalInitMetaPerApp: TotalInitMetaPerApp<T>[];
  groupInitMeta: ExtensionInitMeta<T>[],
  moduleName: string;
}
```

**Other changes**

| Commit | Type | Description |
| -- | -- | -- |
| [a66c32b7d8](https://github.com/ditsmod/ditsmod/commit/a66c32b7d869f) | feat | added `preparedRouteMeta.countOfGuards`. |
| [09b1b75177](https://github.com/ditsmod/ditsmod/commit/09b1b75177939) | feat | added `OptionalProps` as type helper. |
| [647c365ace](https://github.com/ditsmod/ditsmod/commit/647c365ace579) | feat | added `RequireProps` type helper. |
| [16261f4119](https://github.com/ditsmod/ditsmod/commit/16261f4119be2) | feat | added typed parameter T for `getTokens<T>()`. |
| [98ba0cfa18](https://github.com/ditsmod/ditsmod/commit/98ba0cfa186cf) | feat | allow passing `Extension` and `ExtensionsGroupToken` without type parameter. |
| [1a32dbcf05](https://github.com/ditsmod/ditsmod/commit/1a32dbcf05373) | feat | introduced `parentGetter()` and `setParentGetter()` for `Injector`. |

<a name="core-2.55.2"></a>
## [core-2.55.2](https://github.com/ditsmod/ditsmod/releases/tag/core-2.55.2) (2024-09-01)

| Commit | Type | Description |
| -- | -- | -- |
| [fde5c079a9](https://github.com/ditsmod/ditsmod/commit/fde5c079a92a) | fix | Fixed `Symbol.iterator` in `Providers` helper. |

<a name="core-2.55.1"></a>
## [core-2.55.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.55.1) (2024-08-23)

| Commit | Type | Description |
| -- | -- | -- |
| [039556c2e0](https://github.com/ditsmod/ditsmod/commit/039556c2e02) | fix | Allow `undefined` as providers value. |

<a name="core-2.55.0"></a>
## [core-2.55.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.55.0) (2024-08-16)

**Breaking Changes**

- [removed](https://github.com/ditsmod/ditsmod/commit/25abab04601) `preRouter.decodeUrl()`.
- [renamed](https://github.com/ditsmod/ditsmod/commit/cd9fec65f2e) `providers.use()` to `providers.$use()`.

**Other changes**

| Commit | Type | Description |
| -- | -- | -- |
| [6767399700](https://github.com/ditsmod/ditsmod/commit/6767399700) | fix | Introduced `$if()` method for Providers helper. |
| [e1fa4f0024](https://github.com/ditsmod/ditsmod/commit/e1fa4f0024) | fix | Allow passing instance of Providers helper to `providersPer*`. |
| [77ccff93a3](https://github.com/ditsmod/ditsmod/commit/77ccff93a3) | fix | Introduced `providers.passThrough()`. |
| [9357078583](https://github.com/ditsmod/ditsmod/commit/9357078583) | fix | Fixed type for request handler. |

<a name="core-2.54.2"></a>
## [core-2.54.2](https://github.com/ditsmod/ditsmod/releases/tag/core-2.54.2) (2024-08-13)

| Commit | Type | Description |
| -- | -- | -- |
| [7773922c43](https://github.com/ditsmod/ditsmod/commit/7773922c43f) | fix | Fixed returning from `AppInitializer#requestListener()`. |

<a name="core-2.54.0"></a>
## [core-2.54.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.54.0) (2024-08-06)

| Commit | Type | Description |
| -- | -- | -- |
| [7e2a5195f2](https://github.com/ditsmod/ditsmod/commit/7e2a5195f245d7) | refactor | Hide logs from external modules, by default. |
| [83542addf2](https://github.com/ditsmod/ditsmod/commit/83542addf21412) | refactor | Now the name of the module where the logs were recorded is added to all logs. |
| [41d6c2eeb2](https://github.com/ditsmod/ditsmod/commit/41d6c2eeb2fe24) | refactor | Allow collisions in host modules. |
| [7823a7aa93](https://github.com/ditsmod/ditsmod/commit/7823a7aa93e3e1) | refactor | Introduced `DecoratorAndValue#declaredInDir` property. |
| [2f1d6c6f0c](https://github.com/ditsmod/ditsmod/commit/2f1d6c6f0ccd6c) | refactor | Introduced `ExtensionObj#exportedOnly`. |
| [c3910acae2](https://github.com/ditsmod/ditsmod/commit/c3910acae2989a) | refactor | Fixed `AppInitializer#logExtensionsStatistic()`, now counter works as expected. |

<a name="core-2.53.2"></a>
## [core-2.53.2](https://github.com/ditsmod/ditsmod/releases/tag/core-2.53.2) (2024-08-04)

| Commit | Type | Description |
| -- | -- | -- |
| [a9d97687f9](https://github.com/ditsmod/ditsmod/commit/a9d97687f989a6209c6eededbad48b872a4463e9) | fix | fixed `getCallerDir()`. |

<a name="core-2.53.1"></a>
## [core-2.53.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.53.1) (2024-07-22)

| Commit | Type | Description |
| -- | -- | -- |
| [7643ee3f2a](https://github.com/ditsmod/ditsmod/commit/7643ee3f2a) | fix | fixed `DefaultSingletonHttpErrorHandler`. |

<a name="core-2.53.0"></a>
## [core-2.53.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.53.0) (2024-07-22)

**Breaking Changes**

- renamed `createServerAndListen()` to `createServerAndBindToListening()` [faeb38a784](https://github.com/ditsmod/ditsmod/commit/faeb38a784fc96c8fc45ab4dce7f22d8c8e23961).


| Commit | Type | Description |
| -- | -- | -- |
| [f6c97987ce](https://github.com/ditsmod/ditsmod/commit/f6c97987cec16) | refactor | refactoring sending unknow an error in `DefaultHttpErrorHandler`. |
| [e3b4c8f48b](https://github.com/ditsmod/ditsmod/commit/e3b4c8f48b3d5) | refactor | refactoring `RegistryOfInjector`. |

<a name="core-2.52.0"></a>
## [core-2.52.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.52.0) (2024-04-02)

**Breaking Changes**

- renamed `SingletonHttpFrontend` to `DefaultSingletonHttpFrontend` [34c1f18eb4](https://github.com/ditsmod/ditsmod/commit/34c1f18eb4fa9b5a959ec34f7c8497a52cfc5afc).
- renamed `SingletonChainMaker` to `DefaultSingletonChainMaker` [6f6bdd4c64](https://github.com/ditsmod/ditsmod/commit/6f6bdd4c6493ee88c0d8d7f0c9bf81cd4dcdc75d).
- renamed `SingletonHttpErrorHandler` to `DefaultSingletonHttpErrorHandler` [d3be41e942](https://github.com/ditsmod/ditsmod/commit/d3be41e942905ced21304dad2910ee2682405aa8).


| Commit | Type | Description |
| -- | -- | -- |
| [5af42900c4](https://github.com/ditsmod/ditsmod/commit/5af42900c4b4dfa1e9a4e7a3918e390608211b38) | feat | added `Res#setHeaders`. |
| [16141c9cfd](https://github.com/ditsmod/ditsmod/commit/16141c9cfd82ec82f043bc34a613256a95f521f3) | feat | added ability pass headers to `Res#send()`. |
| [b2c9fdd160](https://github.com/ditsmod/ditsmod/commit/b2c9fdd160c522102898cc135016013a8c5c9d92) | feat | extended `RequestContext`. |
| [951e096b2d](https://github.com/ditsmod/ditsmod/commit/951e096b2d503bb0c287e13bd2552ed943d9c97a) | feat | added `HttpHeaders` interface. |
| [9e1f71972c](https://github.com/ditsmod/ditsmod/commit/9e1f71972ce28c92592fd30b2b4d1adb471252d8) | feat | added `RequestContext` to `defaultProvidersPerApp`. |
| [5f0fe6e030](https://github.com/ditsmod/ditsmod/commit/5f0fe6e0302b8c3d9fc010581429d24f66ea329c) | fix | fixed import `makeClassDecorator` for `GuardMetadata`. |
| [e52d41f3ff](https://github.com/ditsmod/ditsmod/commit/e52d41f3ffae0db5d9f0c6e59ac487b36117bebb) | fix | fixed type for `A_PATH_PARAMS`. |
| [a0149e582b](https://github.com/ditsmod/ditsmod/commit/a0149e582b32bbc16c2d317fdd9bed8797418e53) | refactor | refactoring `Logger` and `ConsoleLogger`. |
| [fd63181078](https://github.com/ditsmod/ditsmod/commit/fd631810781141c2a09f3e17130f6924c9374e68) | refactor | refactoring `ConsoleLogger`. |
| [9189d9644d](https://github.com/ditsmod/ditsmod/commit/9189d9644de6cd37affb26d19b757b5889512a7a) | refactor | change default log level for `ErrorOpts`. |
| [66f468f783](https://github.com/ditsmod/ditsmod/commit/66f468f783dbe4003b728d888c0a7910d1d39700) | refactor | apply new methods for `RequestContext`. |

<a name="core-2.51.2"></a>
## [core-2.51.2](https://github.com/ditsmod/ditsmod/releases/tag/core-2.51.2) (2024-02-10)

| Commit | Type | Description |
| -- | -- | -- |
| [820b3e6d39](https://github.com/ditsmod/ditsmod/commit/820b3e6d39238b17bdf5d48857956ad7a221c5c7) | fix | Fixed passing request context to singleton interceptors. |

<a name="core-2.51.1"></a>
## [core-2.51.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.51.1) (2023-10-08)

### Bug fix

- Fixed typo in `SingletonRequestContext` property.

<a name="core-2.51.0"></a>
## [core-2.51.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.51.0) (2023-10-07)

### Features

- Introduced `@guard()` decorator.

<a name="core-2.50.1"></a>
## [core-2.50.1](https://github.com/ditsmod/ditsmod/releases/tag/core-2.50.1) (2023-10-03)

### Bug fix

- Added support for sigleton HTTP interceptors.

<a name="core-2.50.0"></a>
## [core-2.50.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.50.0) (2023-09-30)

### Features

- Introduced `RequestContext` for HTTP interceptors:

  ```ts
  interface HttpInterceptor {
    intercept(next: HttpHandler, ctx: RequestContext): Promise<any>;
  }
  ```
- Introduced `@controller({ isSingleton: true })` options. You can now specify that your controller is a singleton. In this case, the controller receives a `RequestContext`, but an injector is not created for it on every request. Routes in such a controller are very fast.

<a name="core-2.49.0"></a>
## [core-2.49.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.49.0) (2023-09-15)

### Features

- Added a check to determine if the imported module is external. This change applies to exporting providers and extensions from the root module. Previously, these extensions and providers were added to all modules without exception, including external modules (which are usually placed in the `node_modules` folder). And it was unnecessary, because external modules do not need "global" providers and extensions. Therefore, it is no longer available in this release.

- Added `bufferLogs` option:

  ```ts
  import { Application } from '@ditsmod/core';
  import { AppModule } from './app/app.module.js';

  const app = await new Application().bootstrap(AppModule, { bufferLogs: false });
  app.server.listen(3000, '0.0.0.0');
  ```
  If `{ bufferLogs: true }`, all messages are buffered during application initialization and flushed afterwards. This can be useful if you want all messages to be recorded by the final logger, which is configured after the application is fully initialized.

  Default - `true`.

- Reduced `Logger` interface requirements. Now the logger you can use to substitute the default `ConsoleLogger` should have only three methods:

  ```ts
  log(level: InputLogLevel, ...args: any[]);

  setLevel(value: OutputLogLevel);

  getLevel(): OutputLogLevel;
  ```

- Now `res.nodeRes` is public property, so you can use this native Node.js response object.

### Bug fixes

- When appending modules, their `providersPerApp` was ignored. In this release, they are taken into account.
- Fixed `cleanErrorTrace()`.

<a name="core-2.48.0"></a>
## [core-2.48.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.48.0) (2023-09-07)

### Features

- Added `Injector#pull()` method.
  If the nearest provider with the given `token` is in the parent injector, then this method pulls that provider into the current injector. After that, it works the same as `injector.get()`. If the nearest provider with the given `token` is in the current injector, then this method behaves exactly like `injector.get()`. This method is primarily useful because it allows you, in the context of the current injector, to rebuild instances of providers that depend on a particular configuration that may be different in the current and parent injectors:

  ```ts
  import { injectable, Injector } from '@ditsmod/core';

  class Config {
    one: any;
    two: any;
  }

  @injectable()
  class Service {
    constructor(public config: Config) {}
  }

  const parent = Injector.resolveAndCreate([Service, { token: Config, useValue: { one: 1, two: 2 } }]);
  const child = parent.resolveAndCreateChild([{ token: Config, useValue: { one: 11, two: 22 } }]);
  child.get(Service).config; // returns from parent injector: { one: 1, two: 2 }
  child.pull(Service).config; // pulls Service in current injector: { one: 11, two: 22 }
  child.get(Service).config; // now, in current injector, works cache: { one: 11, two: 22 }
  ```

- Added `isClassFactoryProvider()` type guard.
- In `Providers` helper, added support for `FunctionFactoryProvider`.

<a name="core-2.47.0"></a>
## [core-2.47.0](https://github.com/ditsmod/ditsmod/releases/tag/core-2.47.0) (2023-08-28)

### Features and Breaking changes

- Migration to ESM.
