import { Logger, LoggerConfig } from '#types/logger.js';
import { Class, FunctionFactoryProvider, UseFactoryTuple } from '#di';
import { LogMediator } from '#log-mediator/log-mediator.js';
import { SystemLogMediator } from '#log-mediator/system-log-mediator.js';
import { OutputLogFilter } from '#log-mediator/types.js';
import { AnyFn } from '#types/mix.js';
import { NormalizedProvider } from './ng-utils.js';

/**
 * This class has utilites to adding providers to DI in more type safe way.
 * 
 * You can use this as follow:
 * ```ts
  Module({
    // ...
    providersPerMod: [
      ...new Providers()
        .useLogConfig({ level: 'debug' })
        .useClass(SomeService, ExtendedService)
    ],
  })
  export class SomeModule {}
 * ```
 * 
 * ### Plugins
 * 
 * You can even use plugins for this class:
 * 
 * ```ts
  class Plugin1 extends Providers {
    method1() {
      // ...
      return this;
    }
  }

  class Plugin2 extends Providers {
    method2() {
      // ...
      return this;
    }
  }

  ...new Providers()
    .use(Plugin1)
    .use(Plugin2)
    .method1()
    .method2()
    .useLogConfig({ level: 'trace' })
    .useClass(SomeService, ExtendedService)
 * ```
 * 
 * That is, after using the use() method, you will be able to use plugin methods.
 */
export class Providers {
  protected providers: NormalizedProvider[] = [];
  protected index = -1;

  useValue<T>(token: any, useValue: T, multi?: boolean) {
    this.pushProvider({ token, useValue }, multi);
    return this;
  }

  useClass<A extends Class, B extends A>(token: A, useClass: B, multi?: boolean) {
    this.pushProvider({ token, useClass }, multi);
    return this;
  }

  useToken<T>(token: any, useToken: T, multi?: boolean) {
    this.pushProvider({ token, useToken }, multi);
    return this;
  }

  useFactory(token: any, useFactory: AnyFn, deps?: any[], multi?: boolean): this;
  useFactory(token: any, useFactory: UseFactoryTuple, multi?: boolean): this;
  useFactory(token: any, useFactory: UseFactoryTuple | AnyFn, depsOrMulti?: any[] | boolean, multi?: boolean) {
    if (Array.isArray(useFactory)) {
      this.pushProvider({ token, useFactory }, depsOrMulti as boolean);
    } else {
      if (depsOrMulti) {
        this.pushProvider({ token, useFactory, deps: depsOrMulti } as FunctionFactoryProvider, multi);
      } else {
        this.pushProvider({ token, useFactory } as FunctionFactoryProvider, multi);
      }
    }
    return this;
  }

  useLogger(useLogger: Partial<Logger>, useConfig?: LoggerConfig) {
    this.providers.push({ token: Logger, useValue: useLogger });
    if (useConfig) {
      this.providers.push({ token: LoggerConfig, useValue: useConfig });
    }

    return this;
  }

  useLogConfig(useConfig: LoggerConfig, outputLogFilter?: OutputLogFilter) {
    this.providers.push({ token: LoggerConfig, useValue: useConfig });
    if (outputLogFilter) {
      this.providers.push({ token: OutputLogFilter, useValue: outputLogFilter });
    }

    return this;
  }

  useSystemLogMediator<T extends Class<LogMediator>>(CustomLogMediator: T) {
    this.providers.push(
      { token: CustomLogMediator, useClass: CustomLogMediator },
      { token: SystemLogMediator, useToken: CustomLogMediator },
    );

    return this;
  }

  use<T extends Class<Providers>>(Plugin: T): T['prototype'] & this {
    Object.getOwnPropertyNames(Plugin.prototype)
      .filter((p) => p != 'constructor')
      .forEach((p) => {
        (this as any)[p] = Plugin.prototype[p];
      });
    return this;
  }

  protected [Symbol.iterator]() {
    return this;
  }

  protected next() {
    return { value: this.providers[++this.index], done: !(this.index in this.providers) };
  }

  protected pushProvider(provider: NormalizedProvider, multi?: boolean) {
    if (multi) {
      provider.multi = multi;
    }
    this.providers.push(provider);
  }
}
