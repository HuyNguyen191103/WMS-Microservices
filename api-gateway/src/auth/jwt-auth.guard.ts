import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createVerify } from 'crypto';
import { existsSync, readFileSync } from 'fs';
import { isAbsolute, resolve } from 'path';
import type {
  AuthenticatedRequest,
  AuthenticatedUser,
} from './authenticated-user.interface';

interface JwtHeader {
  alg?: string;
  typ?: string;
}

interface JwtPayload {
  sub?: string;
  userId?: string;
  username?: string;
  roles?: unknown;
  exp?: number;
  nbf?: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private publicKey?: string;

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request.headers.authorization);
    request.user = this.verifyToken(token);

    return true;
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    return token;
  }

  private verifyToken(token: string): AuthenticatedUser {
    try {
      const [encodedHeader, encodedPayload, signature] = token.split('.');
      if (!encodedHeader || !encodedPayload || !signature) {
        throw new Error('Malformed JWT');
      }

      const header = this.decodeJson<JwtHeader>(encodedHeader);
      if (header.alg !== 'RS256') {
        throw new Error('Unsupported JWT algorithm');
      }

      const verifier = createVerify('RSA-SHA256');
      verifier.update(`${encodedHeader}.${encodedPayload}`);
      verifier.end();

      const isValidSignature = verifier.verify(
        this.getPublicKey(),
        this.base64UrlToBuffer(signature),
      );
      if (!isValidSignature) {
        throw new Error('Invalid JWT signature');
      }

      const payload = this.decodeJson<JwtPayload>(encodedPayload);
      this.assertTimeClaims(payload);

      if (!payload.sub || !payload.userId || !payload.username) {
        throw new Error('Missing required JWT claims');
      }

      return {
        user_id: payload.userId,
        username: payload.username,
        mail: payload.sub,
        roles: this.toRoles(payload.roles),
      };
    } catch (error) {
      this.logger.warn(`JWT verification failed: ${this.errorMessage(error)}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  private getPublicKey(): string {
    if (this.publicKey) {
      return this.publicKey;
    }

    const keyPath = this.configService.get<string>(
      'JWT_PUBLIC_KEY_PATH',
      'keys/public.pem',
    );
    if (!keyPath) {
      throw new Error('JWT_PUBLIC_KEY_PATH is not configured');
    }

    const resolvedPath = isAbsolute(keyPath) ? keyPath : resolve(keyPath);
    if (!existsSync(resolvedPath)) {
      throw new Error(`JWT public key file not found: ${resolvedPath}`);
    }

    this.publicKey = readFileSync(resolvedPath, 'utf8');
    return this.publicKey;
  }

  private decodeJson<T>(value: string): T {
    return JSON.parse(this.base64UrlToBuffer(value).toString('utf8')) as T;
  }

  private base64UrlToBuffer(value: string): Buffer {
    return Buffer.from(value, 'base64url');
  }

  private assertTimeClaims(payload: JwtPayload) {
    const now = Math.floor(Date.now() / 1000);

    if (typeof payload.exp !== 'number' || payload.exp <= now) {
      throw new Error('JWT is expired');
    }

    if (typeof payload.nbf === 'number' && payload.nbf > now) {
      throw new Error('JWT is not active yet');
    }
  }

  private toRoles(roles: unknown): string[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.filter((role): role is string => typeof role === 'string');
  }

  private errorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'unknown error';
  }
}
