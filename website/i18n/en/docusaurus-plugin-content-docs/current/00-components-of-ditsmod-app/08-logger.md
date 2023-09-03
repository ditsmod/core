---
sidebar_position: 8
---

# Logger

Ditsmod uses the [Logger][100] class as an interface as well as a DI token. By default, [ConsoleLogger][101] is used for logging. There are 8 logging levels in total (borrowed from [log4j][102]):

- `off` - No events will be logged. Intended for testing, it is not recommended to use it in product mode.
- `fatal` - A fatal event that will prevent the application from continuing.
- `error` - An error in the application, possibly recoverable.
- `warn` - An event that might possible lead to an error.
- `info` - An event for informational purposes.
- `debug` - A general debugging event.
- `trace` - A fine-grained debug message, typically capturing the flow through the application.
- `all`- All events should be logged.

If you want the system logs written by Ditsmod to be written by your own logger, it must implement the [Logger][100] interface. It can then be passed to DI at the application level:

```ts
import { Logger, rootModule } from '@ditsmod/core';
import { MyLogger } from './my-loggegr.js';

@rootModule({
  // ...
  providersPerApp: [
    { token: Logger, useClass: MyLogger }
  ],
})
export class AppModule {}
```

But, most likely, you will want to use some ready-made, well-known logger. And there is a good chance that its interface is different from that of [Logger][100]. But, as a rule, this is also not a problem, because before transferring the logger instance to DI, it can be patched so that it implements the necessary interface. For this, a provider with the `useFactory` property is used.

Let's write the code for this provider first. At the moment (2023-09-02), one of the most popular Node.js loggers is [winston][103]. For patching, we wrote a class method before which we added the `methodFactory` decorator:

```ts {42-44,47-49}
import { Logger, LoggerConfig, LogLevel, methodFactory } from '@ditsmod/core';
import { createLogger, addColors, format, transports } from 'winston';

export class PatchLogger {
  @methodFactory()
  patchLogger(config: LoggerConfig) {
    const logger = createLogger();

    const transport = new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    });

    const customLevels = {
      levels: {
        off: 0,
        fatal: 1,
        error: 2,
        warn: 3,
        info: 4,
        debug: 5,
        trace: 6,
        all: 7,
      },
      colors: {
        fatal: 'red',
        error: 'brown',
        warn: 'yellow',
        info: 'blue',
        debug: 'green',
        trace: 'grey',
        all: 'grey',
      },
    };

    logger.configure({
      levels: customLevels.levels,
      level: config.level,
      transports: [transport],
    });

    // Logger must have `mergeConfig` method.
    (logger as unknown as Logger).mergeConfig = (config: LoggerConfig) => {
      logger.level = config.level;
    };

    // Logger must have `getConfig` method.
    (logger as unknown as Logger).getConfig = () => {
      return { level: logger.level as LogLevel };
    };

    addColors(customLevels.colors);

    return logger;
  }
}
```

As you can see, in addition to the usual settings for `winston`, the highlighted lines add two methods to his instance - `mergeConfig` and `getConfig` - which it does not have, but which are necessary for Ditsmod to interact with it properly.

And now this class can be passed to DI at the application level:

```ts
import { Logger, rootModule } from '@ditsmod/core';
import { PatchLogger } from './patch-logger.js';

@rootModule({
  // ...
  providersPerApp: [
    { token: Logger, useFactory: [PatchLogger, PatchLogger.prototype.patchLogger] }
  ],
})
export class AppModule {}
```

You can view finished examples with loggers [in the Ditsmod repository][104].

## Using the logger in production mode

To change the logging level in production mode, you do not need to change the compiled code. You can create a custom controller, guard it, and then call the appropriate route to change the logging level that you specify in the URL:

```ts
import { AnyObj, controller, inject, Logger, LogLevel, QUERY_PARAMS, Res, route } from '@ditsmod/core';

import { requirePermissions } from '../auth/guards-utils.js';
import { Permission } from '../auth/types.js';

@controller()
export class SomeController {
  @route('GET', 'set-loglevel', [requirePermissions(Permission.canSetLogLevel)])
  setLogLevel(@inject(QUERY_PARAMS) queryParams: AnyObj, logger: Logger, res: Res) {
    const level = queryParams.logLevel as LogLevel;
    try {
      logger.mergeConfig({ level });
      res.send('Setting logLevel successful!');
    } catch (error: any) {
      res.send(`Setting logLevel is failed: ${error.message}`);
    }
  }
}
```

As you can see, the route path `/set-loglevel` is created here, with protection through a guard that checks the permissions for such an action. This uses `requirePermissions()`, which you can read about in [Helpers for guards with parameters][1].





[1]: /components-of-ditsmod-app/guards#helpers-for-guards-with-parameters





[100]: https://github.com/ditsmod/ditsmod/blob/core-2.47.0/packages/core/src/types/logger.ts#L40
[101]: https://github.com/ditsmod/ditsmod/blob/core-2.47.0/packages/core/src/services/console-logger.ts
[102]: https://logging.apache.org/log4j/2.x/log4j-api/apidocs/org/apache/logging/log4j/Level.html
[103]: https://github.com/winstonjs/winston
[104]: https://github.com/ditsmod/ditsmod/tree/core-2.47.0/examples/04-logger/src/app/modules