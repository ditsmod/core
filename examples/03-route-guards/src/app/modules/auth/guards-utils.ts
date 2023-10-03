import { createHelperForGuardWithParams } from '@ditsmod/core';

import { PermissionsGuard } from './permissions.guard.js';
import { Permission } from './types.js';
import { SingletonPermissionsGuard } from './singleton-permissions.guard.js';

export const requirePermissions = createHelperForGuardWithParams<Permission>(PermissionsGuard);
/**
 * Singleton permission guard.
 */
export const requirePermissionsSngl = createHelperForGuardWithParams<Permission>(SingletonPermissionsGuard);
