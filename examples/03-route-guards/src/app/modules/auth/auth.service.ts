import { injectable } from '@ditsmod/core';
import { Permission } from './types.js';

@injectable()
export class AuthService {
  /**
   * Here you need implement more logic.
   */
  async hasPermissions(permissions?: Permission[]) {
    const currentUser = { permissions: [Permission.canActivateSomeResource] };

    return permissions?.every((permission) => currentUser.permissions.includes(permission));
  }
  /**
   * Here you need implement more logic.
   */
  async getSession(token: string) {
    return { userName: 'Name1', email: 'some@gmail.com' };
  }
}
