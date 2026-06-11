import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLog } from '../activity-log/entities/activity-log.entity';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseGrpcController } from './warehouse.grpc.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [TypeOrmModule.forFeature([Warehouse, WarehouseLocation, ActivityLog])],
  controllers: [WarehouseGrpcController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
