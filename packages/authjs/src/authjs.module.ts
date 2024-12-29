import { featureModule, OnModuleInit, Logger, inject, CustomError } from '@ditsmod/core';
import { type AuthConfig } from '@auth/core';
import { RoutingModule } from '@ditsmod/routing';
import { BodyParserModule } from '@ditsmod/body-parser';
import { OasOptions, Parameters } from '@ditsmod/openapi';
import { LoggerInstance } from '@auth/core/types';

import { AUTHJS_CONFIG, AUTHJS_SESSION } from './constants.js';
import { AuthjsController } from '#mod/authjs.controller.js';
import { AuthjsGuard } from '#mod/authjs.guard.js';
import { AuthjsPerRouGuard } from './authjs-per-rou.guard.js';
import { Params } from './types.js';

/**
 * Ditsmod module to support [Auth.js][1].
 *
 * [1]: https://authjs.dev/
 */
@featureModule({
  imports: [RoutingModule, BodyParserModule],
  providersPerMod: [{ token: AUTHJS_CONFIG, useValue: {} }],
  providersPerRou: [{ token: AuthjsGuard, useClass: AuthjsPerRouGuard }],
  providersPerReq: [AuthjsGuard, { token: AUTHJS_SESSION, useValue: {} }],
  controllers: [AuthjsController],
  exports: [AUTHJS_CONFIG, AUTHJS_SESSION, AuthjsGuard],
  extensionsMeta: {
    oasOptions: { tags: ['authjs'] } as OasOptions,
  },
})
export class AuthjsModule implements OnModuleInit {
  constructor(
    @inject(AUTHJS_CONFIG) protected authConfig: AuthConfig,
    protected logger: Logger,
  ) {}

  onModuleInit() {
    this.patchAuthjsConfig();
  }

  protected patchAuthjsConfig() {
    this.authConfig.logger ??= {
      error: (err) => {
        const chainError = new CustomError(
          { msg1: 'Auth.js message' },
          { cause: err, constructorOpt: this.patchAuthjsConfig },
        );
        this.logger.log('error', chainError);
      },
      debug: (message) => {
        this.logger.log('debug', `Auth.js message: ${message}`);
      },
      warn: (message) => {
        this.logger.log('warn', `Auth.js message: ${message}`);
      },
    } satisfies LoggerInstance;
  }
}
