import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthModule } from '../../auth/auth.module';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

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
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
