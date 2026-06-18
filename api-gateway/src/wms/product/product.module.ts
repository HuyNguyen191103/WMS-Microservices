import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WmsGrpcClientModule } from '../grpc/wms-grpc-client.module';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';

@Module({
  imports: [AuthModule, WmsGrpcClientModule],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
