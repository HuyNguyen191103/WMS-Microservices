import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../activity-log/entities/activity-log.entity';
import { Product } from './entities/product.entity';
import { ProductGrpcController } from './product.grpc.controller';
import { ProductService } from './product.service';

@Module({
  imports: [TypeOrmModule.forFeature([Product, ActivityLog])],
  controllers: [ProductGrpcController],
  providers: [ProductService],
})
export class ProductModule {}
