---
sidebar_position: 3
---

# Export, import, append

## Export providers from non-root module

By exporting providers from a particular module, you declare that they are available for use in other modules that will import that module:

```ts {8}
import { featureModule } from '@ditsmod/core';

import { FirstService } from './first.service';
import { SecondService } from './second.service';

@featureModule({
  providersPerMod: [FirstService, { token: SecondService, useClass: SecondService }],
  exports: [SecondService],
})
export class SomeModule {}
```

Please note that only provider tokens or modules can be added to the `exports` array. In this case, the `{ token: SecondService, useClass: SecondService }` object cannot be added to the `exports` array, because this object is not a token or a module. Also, keep in mind that only the services that will be directly used in external modules need to be exported from a specific module. In this case, `SecondService` may depend on `FirstService`, but `FirstService` does not need to be exported if it is not directly used in an external module. This ensures module encapsulation.

You can export providers only those that are transferred to the following arrays:

- `providersPerMod`;
- `providersPerRou`;
- `providersPerReq`.

Exporting the providers passed in `providersPerApp` does not make sense, as using this array DI will generate an [injector][1] at the application level. That is, providers from this array will be available for any module, at any level, and without export.

It also doesn't make sense to export the controllers, because the export only affects the providers.

## Export providers from the root module

Exporting providers from the root module means that these providers will automatically be added to every module in the application:

```ts {9}
import { rootModule } from '@ditsmod/core';

import { SomeService } from './some.service';
import { OtherModule } from './other.module';

@rootModule({
  imports: [OtherModule],
  providersPerRou: [SomeService],
  exports: [SomeService, OtherModule],
})
export class AppModule {}
```

In this case, `SomeService` will be added to absolutely all application modules at the route level. As you can see, you can also export entire modules. In this case, all providers exported from `OtherModule` will also be added to each application module.

## Import module

You cannot import a single provider into a Ditsmod module, but you can import an entire module with all the providers and [extensions][2] exported in it:

```ts {7}
import { featureModule } from '@ditsmod/core';

import { FirstModule } from './first.module';

@featureModule({
  imports: [
    FirstModule
  ]
})
export class SecondModule {}
```

If `FirstModule` exports, for example, `SomeService`, then this service can now be used in `SecondModule` in any of its services or controllers. However, if `FirstModule` has controllers, they will be ignored in this import form. For Ditsmod to take into account controllers from an imported module, the module must be imported with a prefix passed in `path`:

```ts {4}
// ...
@featureModule({
  imports: [
    { path: '', module: FirstModule }
  ]
})
export class SecondModule {}
```

Although here `path` is an empty string, for Ditsmod the presence of `path` means:

1. that you also need to take into account the controllers from the imported module;
2. use `path` as a prefix for all routes imported from `FirstModule`.

As you can see, in the previous example, this time, neither the service nor the module is imported, but the object. This object has the following interface:

<a id="ModuleWithParams"></a>

```ts
interface ModuleWithParams<M extends AnyObj = AnyObj, E extends AnyObj = AnyObj> {
  id?: string;
  module: ModuleType<M>;
  path?: string;
  guards?: GuardItem[];
  /**
   * List of modules, `ModuleWithParams` or tokens of providers exported by this
   * module.
   */
  exports?: any[];
  providersPerApp?: ServiceProvider[];
  providersPerMod?: ServiceProvider[];
  providersPerRou?: ServiceProvider[];
  providersPerReq?: ServiceProvider[];
  /**
   * This property allows you to pass any information to extensions.
   *
   * You must follow this rule: data for one extension - one key in `extensionsMeta` object.
   */
  extensionsMeta?: E;
}
```

Note that only the `module` property is required in this interface.

When importing an object with this type, you can pass a module with certain options/parameters in abbreviated form. To see this clearly, let's take the previous example again:

```ts {4}
// ...
@featureModule({
  imports: [
    { path: '', module: FirstModule }
  ]
})
export class SecondModule {}
```

If you wrote `FirstModule` and knew that this module would make sense to be imported many times into different modules with different prefixes, then in this case you could write a static method in this class that returns an object specially designed for import:

```ts
// ...
export class FirstModule {
  static withPrefix(path: string) {
    return {
      module: this,
      path
    }
  }
}
```

Now the object returned by this method can be imported as follows:

```ts {4}
// ...
@featureModule({
  imports: [
    FirstModule.withPrefix('some-prefix')
  ]
})
export class SecondModule {}
```

In this case, the reduction of the code almost did not occur compared to the previous example, when we imported the object directly, and the readability also worsened. So when writing static import methods, consider whether they simplify the code.

In order for TypeScript to control exactly what the static import method returns, it is recommended to use the `ModuleWithParams` interface:

```ts
import { ModuleWithParams } from '@ditsmod/core';
// ...
export class SomeModule {
  static withParams(someParams: SomeParams): ModuleWithParams<SomeModule> {
    return {
      module: this,
      // ...
    }
  }
}
```

## Appending of the module

If you don't need to import providers and [extensions][2] into the current module, but just append the external module to the prefix of the current module, you can use the `appends` array:

```ts {6}
import { featureModule } from '@ditsmod/core';

import { FirstModule } from './first.module';

@featureModule({
  appends: [FirstModule]
})
export class SecondModule {}
```

In this case, if `SecondModule` has a prefix, it will be used as a prefix for all routes contained in `FirstModule`. Only those modules with controllers can be appending.

You can also attach an additional prefix to `FirstModule`:

```ts {3}
// ...
@featureModule({
  appends: [{ path: 'some-path', module: FirstModule }]
})
export class SecondModule {}
```

In this example, an object was used, in which the module is passed for appending, it has the following interface:

```ts
interface AppendsWithParams<T extends AnyObj = AnyObj> {
  id?: string;
  path: string;
  module: ModuleType<T>;
  guards?: GuardItem[];
}
```

## Re-export of the module

In addition to importing a specific module, the same module can be simultaneously exported:

```ts
import { featureModule } from '@ditsmod/core';

import { FirstModule } from './first.module';

@featureModule({
  imports: [FirstModule],
  exports: [FirstModule],
})
export class SecondModule {}
```

What is the meaning of this? - Now if you import `SecondModule` into some other module, you will actually have `FirstModule` imported as well.

Pay attention! If during re-export you import an object with `ModuleWithParams` interface, the same object must also be exported:

```ts
import { featureModule, ModuleWithParams } from '@ditsmod/core';

import { FirstModule } from './first.module';

const firstModuleWithParams: ModuleWithParams = { path: 'some-path', module: FirstModule };

@featureModule({
  imports: [firstModuleWithParams],
  exports: [firstModuleWithParams],
})
export class SecondModule {}
```


[1]: /components-of-ditsmod-app/dependency-injection#injector
[2]: /components-of-ditsmod-app/extensions
