import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { WmsGrpcExceptionMapper } from './wms-grpc-exception.mapper';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: WMS_GRPC_CLIENT,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'wns.wms.v1',
            protoPath: join(process.cwd(), '..', 'proto', 'wms.proto'),
            url: configService.get<string>('WMS_GRPC_URL', 'localhost:5002'),
            loader: {
              longs: String,
            },
          },
        }),
      },
    ]),
  ],
  providers: [WmsGrpcExceptionMapper],
  exports: [ClientsModule, WmsGrpcExceptionMapper],
})
export class WmsGrpcClientModule {}
