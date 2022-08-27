import { Logger, LoggerConfig, Module, LogLevel, Providers } from '@ditsmod/core';
import { createLogger, addColors, format, transports } from 'winston';

import { WinstonController } from './winston.controller';

const logger = createLogger();

@Module({
  controllers: [WinstonController],
  providersPerMod: [
    ...new Providers().useLogger(logger, { level: 'debug' })
  ],
})
export class WinstonModule {
  constructor(config: LoggerConfig) {
    this.init(config);
  }

  protected init(config: LoggerConfig) {
    const transport = new transports.Console({
      format: format.combine(format.colorize(), format.simple()),
    });

    const customLevels = {
      levels: {
        fatal: 1,
        error: 2,
        warn: 3,
        info: 4,
        debug: 5,
        trace: 6,
      },
      colors: {
        fatal: 'red',
        error: 'yellow',
        debug: 'green',
        info: 'blue',
        trace: 'grey',
      },
    };

    logger.configure({
      levels: customLevels.levels,
      level: config.level,
      transports: [transport],
    });

    // Logger must have `setLevel` method.
    (logger as unknown as Logger).setLevel = (value: LogLevel) => {
      logger.level = value;
    };

    // Logger must have `getLevel` method.
    (logger as unknown as Logger).getLevel = () => {
      return logger.level as LogLevel;
    };

    addColors(customLevels.colors);
  }
}
