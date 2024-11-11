import { controller, inject, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';

@controller()
export class FirstController {
  constructor(@inject('multi-provider') private multiProvider: any) {}

  @route('GET', 'first')
  getHello(res: Res) {
    res.sendJson(this.multiProvider);
  }
}
