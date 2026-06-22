import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WNS_AUTH_V1_PACKAGE_NAME } from '../generated/auth';
import { AUTH_GRPC_CLIENT } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesGuard } from './roles.guard';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: WNS_AUTH_V1_PACKAGE_NAME,
            protoPath: join(process.cwd(), '..', 'proto', 'auth.proto'),
            url: configService.get<string>('AUTH_GRPC_URL', 'localhost:5001'),
            loader: {
              longs: String,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
