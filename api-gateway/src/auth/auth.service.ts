import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { Metadata, status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import {
  AUTH_API_SERVICE_NAME,
  AuthApiClient as AuthGrpcClient,
  AuthResponse as AuthGrpcResponse,
  GetMeResponse as GetMeGrpcResponse,
  RegisterResponse as RegisterGrpcResponse,
  Role as RoleGrpc,
  UserInfo as UserInfoGrpc,
  UserProfile as UserProfileGrpc,
} from '../generated/auth';
import { AUTH_GRPC_CLIENT } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private authGrpcClient!: AuthGrpcClient;

  constructor(
    @Inject(AUTH_GRPC_CLIENT)
    private readonly client: ClientGrpc,
  ) {}

  onModuleInit() {
    this.authGrpcClient = this.client.getService<AuthGrpcClient>(
      AUTH_API_SERVICE_NAME,
    );
  }

  async register(body: RegisterDto) {
    try {
      const response = await firstValueFrom(
        this.authGrpcClient.register({
          username: body.username,
          mail: body.mail,
          password: body.password,
          phoneNumber: body.phoneNumber,
          address: body.address,
          department: body.department,
        }),
      );

      return this.toRegisterResponse(response);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async login(body: LoginDto) {
    try {
      const response = await firstValueFrom(
        this.authGrpcClient.login({
          mail: body.mail,
          password: body.password,
        }),
      );

      return this.toAuthResponse(response);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  async getMe(userId: string, authorization: string) {
    try {
      const metadata = new Metadata();
      metadata.set('authorization', authorization);

      const response = await firstValueFrom(
        this.authGrpcClient.getMe({ userId }, metadata),
      );

      return this.toGetMeResponse(response);
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toRegisterResponse(response: RegisterGrpcResponse) {
    return {
      user: this.toUserInfo(response.user),
    };
  }

  private toAuthResponse(response: AuthGrpcResponse) {
    return {
      access_token: response.accessToken ?? '',
      expired: Number(response.expired),
    };
  }

  private toGetMeResponse(response: GetMeGrpcResponse) {
    return {
      user: this.toUserInfo(response.user),
    };
  }

  private toUserInfo(user?: UserInfoGrpc) {
    if (!user) {
      return null;
    }

    return {
      user_id: user.userId ?? '',
      username: user.username ?? '',
      mail: user.mail ?? '',
      status: user.status ?? '',
      profile: this.toUserProfile(user.profile),
      roles: (user.roles ?? []).map((role) => this.toRole(role)),
    };
  }

  private toUserProfile(profile?: UserProfileGrpc) {
    if (!profile) {
      return null;
    }

    return {
      profile_id: profile.profileId ?? '',
      phone_number: profile.phoneNumber ?? '',
      address: profile.address ?? '',
      department: profile.department ?? '',
    };
  }

  private toRole(role: RoleGrpc) {
    return {
      role_id: role.roleId ?? '',
      role_name: role.roleName ?? '',
      description: role.description ?? '',
    };
  }

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `Auth gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'Auth service request failed';

    if (grpcError.code === status.INVALID_ARGUMENT) {
      return new BadRequestException(message);
    }

    if (grpcError.code === status.ALREADY_EXISTS) {
      return new ConflictException(message);
    }

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    if (grpcError.code === status.NOT_FOUND) {
      return new NotFoundException(message);
    }

    return new BadGatewayException(message);
  }
}
