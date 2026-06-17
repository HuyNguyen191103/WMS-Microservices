import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseGrpcController } from './warehouse.grpc.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [
    ActivityLogModule,
    TypeOrmModule.forFeature([Warehouse, WarehouseLocation]),
  ],
  controllers: [WarehouseGrpcController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
