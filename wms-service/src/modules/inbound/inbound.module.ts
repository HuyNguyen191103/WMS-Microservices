import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { InventoryModule } from '../inventory/inventory.module';
import { Product } from '../product/entities/product.entity';
import { WarehouseLocation } from '../warehouse/entities/warehouse-location.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { InboundItem } from './entities/inbound-item.entity';
import { InboundOrder } from './entities/inbound-order.entity';
import { InboundGrpcController } from './inbound.grpc.controller';
import { InboundService } from './inbound.service';

@Module({
  imports: [
    ActivityLogModule,
    InventoryModule,
    TypeOrmModule.forFeature([
      InboundOrder,
      InboundItem,
      Product,
      Warehouse,
      WarehouseLocation,
    ]),
  ],
  controllers: [InboundGrpcController],
  providers: [InboundService],
})
export class InboundModule {}
