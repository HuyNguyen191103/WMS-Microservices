import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryItem, InventoryTransaction])],
})
export class InventoryModule {}
