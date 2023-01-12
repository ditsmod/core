import { injectable } from '@ditsmod/core';
import { CustomError } from '@ditsmod/core';

import { ValidationRouteMeta } from './types';
import { ValidationInterceptor } from './validation.interceptor';

/**
 * Interceptor to validate OpenAPI `requestBody`.
 */
@injectable()
export class RequestBodyInterceptor extends ValidationInterceptor {
  protected override prepareAndValidate() {
    const { options, requestBodySchema } = this.routeMeta as ValidationRouteMeta;
    if (this.req.body === undefined) {
      const dict = this.getDict();
      throw new CustomError({
        msg1: dict.missingRequestBody,
        status: options.invalidStatus,
      });
    }

    this.validate(requestBodySchema, this.req.body);
  }
}
