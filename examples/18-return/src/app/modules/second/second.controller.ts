import { controller, RequestContext, route } from '@ditsmod/core';

@controller()
export class SecondController {
  @route('GET', 'second')
  async method1(ctx: RequestContext) {
    ctx.res.send('default send');
  }

  @route('GET', 'second-json')
  async method2() {
    return { msg: 'JSON object' };
  }

  @route('GET', 'second-string')
  async method3() {
    return 'Some string';
  }
}
