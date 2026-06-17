import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { Product } from './entities/product.entity';
import { ProductGrpcController } from './product.grpc.controller';
import { ProductService } from './product.service';

@Module({
  imports: [ActivityLogModule, TypeOrmModule.forFeature([Product])],
  controllers: [ProductGrpcController],
  providers: [ProductService],
})
export class ProductModule {}
