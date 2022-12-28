import { HttpHandler, HttpInterceptor, Req, RouteMeta } from '@ditsmod/core';
import { injectable, optional } from '@ditsmod/core';
import { parse, Headers, Options } from 'get-body';

import { BodyParserConfig } from './body-parser-config';

@injectable()
export class BodyParserInterceptor implements HttpInterceptor {
  constructor(private req: Req, @optional() private config?: BodyParserConfig) {
    this.config = Object.assign({}, new BodyParserConfig(), config); // Merge with default.
  }

  async intercept(routeMeta: RouteMeta, next: HttpHandler) {
    const contentType = this.req.nodeReq.headers['content-type'];
    const hasAcceptableHeaders = this.config?.acceptHeaders?.some((type) => contentType?.includes(type));
    if (!hasAcceptableHeaders) {
      return next.handle(routeMeta);
    }
    const options: Options = { limit: this.config?.maxBodySize };
    this.req.body = await parse(this.req.nodeReq, this.req.nodeReq.headers as Headers, options);

    return next.handle(routeMeta);
  }
}
