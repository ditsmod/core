import { AnyObj, controller, inject, PATH_PARAMS, Res } from '@ditsmod/core';
import { route } from '@ditsmod/routing';
import { JwtService } from '@ditsmod/jwt';

@controller()
export class AuthController {
  constructor(private jwtService: JwtService) {}

  @route('GET', 'get-token-for/:userName')
  async getToken(@inject(PATH_PARAMS) pathParams: AnyObj, res: Res) {
    const token = await this.jwtService.signWithSecret({ userName: pathParams.userName });
    res.send(token);
  }
}
