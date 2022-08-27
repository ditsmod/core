import { Type } from '@ts-stack/di';
import { Logger, LoggerConfig } from '../types/logger';
import { ServiceProvider } from '../types/mix';

/**
 * This class has utilites to adding providers to DI in more type safe way.
 * 
 * You can use this as follow:
 * ```ts
  Module({
    // ...
    providersPerMod: [
      ...new Providers()
        .useValue(LoggerConfig, new LoggerConfig('trace'))
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
    }
  }

  class Plugin2 extends Providers {
    method2() {
      // ...
    }
  }

  ...new Providers()
    .use(Plugin1)
    .use(Plugin2)
    .method1()
    .method2()
    .useValue(LoggerConfig, new LoggerConfig('trace'))
    .useClass(SomeService, ExtendedService)
 * ```
 * 
 * That is, after using the use() method, you will be able to use plugin methods.
 */
export class Providers {
  protected providers: ServiceProvider[] = [];
  protected index = -1;

  useValue<T extends Type<any>>(provide: T, useValue: T['prototype'], multi?: boolean) {
    this.providers.push({ provide, useValue, multi });
    return this;
  }

  useClass<A extends Type<any>, B extends A>(provide: A, useClass: B, multi?: boolean) {
    this.providers.push({ provide, useClass, multi });
    return this;
  }

  useAnyValue(provide: any, useValue: any, multi?: boolean) {
    this.providers.push({ provide, useValue, multi });
    return this;
  }

  useLogger(useLogger: Partial<Logger>, useConfig?: LoggerConfig) {
    this.providers.push({ provide: Logger, useValue: useLogger });
    if (useConfig) {
      this.providers.push({ provide: LoggerConfig, useValue: useConfig });
    }

    return this;
  }

  use<T extends Type<any>>(Plugin: T): T['prototype'] & this {
    Object.getOwnPropertyNames(Plugin.prototype).filter(p => p != 'constructor').forEach(p => {
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
}
