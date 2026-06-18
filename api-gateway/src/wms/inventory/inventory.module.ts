import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthModule } from '../../auth/auth.module';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [
    AuthModule,
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
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
