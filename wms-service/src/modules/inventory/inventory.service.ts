import { Injectable } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';

export interface InventoryMovement {
  warehouseId: string;
  locationId: string;
  productId: string;
  quantityChange: number;
  transactionQuantity?: number;
}

export interface RecordInventoryMovementsRequest {
  transactionType: string;
  referenceNo: string;
  createdBy: string;
  movements: InventoryMovement[];
}

@Injectable()
export class InventoryService {
  async recordInventoryMovements(
    manager: EntityManager,
    request: RecordInventoryMovementsRequest,
  ) {
    for (const movement of request.movements) {
      const existingInventory = await manager.findOne(InventoryItem, {
        where: {
          warehouseId: movement.warehouseId,
          locationId: movement.locationId,
          productId: movement.productId,
        },
      });

      const inventory =
        existingInventory ??
        manager.create(InventoryItem, {
          warehouseId: movement.warehouseId,
          locationId: movement.locationId,
          productId: movement.productId,
          quantity: 0,
        });

      inventory.quantity += movement.quantityChange;
      inventory.updatedAt = new Date();
      await manager.save(inventory);

      await manager.save(
        manager.create(InventoryTransaction, {
          productId: movement.productId,
          warehouseId: movement.warehouseId,
          locationId: movement.locationId,
          transactionType: request.transactionType,
          quantity:
            movement.transactionQuantity ?? Math.abs(movement.quantityChange),
          referenceNo: request.referenceNo,
          createdBy: request.createdBy,
          createdAt: new Date(),
        }),
      );
    }
  }
}
