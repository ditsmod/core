import { controller, Res, route } from '@ditsmod/core';
import { RequestContextWithSession, SessionCookie } from '@ditsmod/session-cookie';

@controller()
export class HelloWorldController {
  constructor(private session: SessionCookie) {}

  @route('GET', 'set')
  setCookie(res: Res) {
    this.session.id = '123';
    res.send('Hello World!\n');
  }

  @route('GET', 'get')
  getCookie(res: Res) {
    res.send(`session ID: ${this.session.id}`);
  }
}

@controller({ isSingleton: true })
export class HelloWorldController2 {
  @route('GET', 'set2')
  setCookie(ctx: RequestContextWithSession) {
    ctx.sessionCookie.id = '123';
    ctx.nodeRes.end('Hello World!\n');
  }

  @route('GET', 'get2')
  getCookie(ctx: RequestContextWithSession) {
    ctx.nodeRes.end(`session ID: ${ctx.sessionCookie.id}`);
  }
}
