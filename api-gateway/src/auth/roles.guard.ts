import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { AuthenticatedRequest } from './authenticated-user.interface';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles =
      this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (allowedRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userRoles = (request.user?.roles ?? []).map((role) =>
      role.toUpperCase(),
    );
    const normalizedAllowedRoles = allowedRoles.map((role) =>
      role.toUpperCase(),
    );

    if (userRoles.some((role) => normalizedAllowedRoles.includes(role))) {
      return true;
    }

    throw new ForbiddenException('You do not have permission');
  }
}
