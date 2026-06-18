import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import { InventoryGrpcController } from './inventory.grpc.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryTransaction])],
  controllers: [InventoryGrpcController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
