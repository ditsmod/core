import { ChainError, ChainErrorOptions, ErrorMediator, injectable } from '@ditsmod/core';

@injectable()
export class RoutingErrorMediator extends ErrorMediator {
  /**
   * `Checking deps in "sandbox" for failed`.
   */
  checkingDepsInSandboxFailed(cause: Error) {
    const opts: ChainErrorOptions = { name: 'Error', cause, constructorOpt: this.checkingDepsInSandboxFailed };
    throw new ChainError('Checking deps in "sandbox" failed', opts);
  }
  /**
   * Setting route '${fullPath}' in ${moduleName} failed: a handle is already registered for this path.
   */
  throwHandleAlreadyRegistered(fullPath: string) {
    const msg = `Setting route '${fullPath}' in ${this.moduleExtract.moduleName} failed: a handle is already registered for this path.`;
    throw new Error(msg);
  }
  /**
   * only one wildcard per path segment is allowed, has: '${path}' in path '${fullPath}'
   */
  throwOnlyOneWildcardPerPath(path: string, fullPath: string) {
    const msg = `only one wildcard per path segment is allowed, has: '${path}' in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   * wildcard route '${path}' conflicts with existing children in path '${fullPath}'
   */
  throwWildcardRouteConflicts(path: string, fullPath: string) {
    const msg = `wildcard route '${path}' conflicts with existing children in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   * wildcards must be named with a non-empty name in path '${fullPath}'
   */
  throwWildcardsMustNonEmpty(fullPath: string) {
    const msg = `wildcards must be named with a non-empty name in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   *
   */
  throwCatchAllRoutesOnlyAtEnd(fullPath: string) {
    const msg = `catch-all routes are only allowed at the end of the path in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   * catch-all conflicts with existing handle for the path segment root in path '${fullPath}'
   */
  throwCatchAllConflictWithExistingHandle(fullPath: string) {
    const msg = `catch-all conflicts with existing handle for the path segment root in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   * no / before catch-all in path '${fullPath}'
   */
  throwNoBeforeCatchAll(fullPath: string) {
    const msg = `no / before catch-all in path '${fullPath}'`;
    throw new Error(msg);
  }
  /**
   * '${pathSeg}' in new path '${fullPath}' conflicts with existing wildcard '${treePath}' in existing prefix '${prefix}'
   */
  throwConflictsWithExistingWildcard(pathSeg: string, fullPath: string, treePath: string, prefix: string) {
    const msg = `'${pathSeg}' in new path '${fullPath}' conflicts with existing wildcard '${treePath}' in existing prefix '${prefix}'`;
    throw new Error(msg);
  }
  /**
   * invalid node type
   */
  throwInvalidNodeType() {
    throw new Error('invalid node type');
  }
}
