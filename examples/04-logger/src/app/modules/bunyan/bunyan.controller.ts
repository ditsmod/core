import { controller, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';
import BunyanLogger from 'bunyan';

@controller()
export class BunyanController {
  @route('GET', 'bunyan')
  async ok(res: Res, logger: BunyanLogger) {
    res.send('see console of node process\n');
    logger.info("it's works!");
  }
}
