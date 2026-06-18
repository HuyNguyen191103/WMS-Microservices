import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryItem } from './entities/inventory-item.entity';
import { InventoryTransaction } from './entities/inventory-transaction.entity';
import {
  InventoryItemGrpc,
  InventoryTransactionGrpc,
  ListInventoryItemsGrpcRequest,
} from './grpc/inventory-grpc.types';

const PAGE_SIZE = 20;

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
  constructor(
    @InjectRepository(InventoryItem)
    private readonly inventoryItemRepository: Repository<InventoryItem>,
    @InjectRepository(InventoryTransaction)
    private readonly inventoryTransactionRepository: Repository<InventoryTransaction>,
  ) {}

  async listInventoryItems(request: ListInventoryItemsGrpcRequest) {
    const warehouseId = request.warehouseId?.trim();
    if (!warehouseId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse id is required',
      });
    }

    const inventoryItems = await this.inventoryItemRepository.find({
      where: { warehouseId },
      relations: {
        warehouse: true,
        location: true,
        product: true,
      },
      order: {
        product: { productName: 'ASC' },
        location: { zone: 'ASC' },
      },
    });

    return {
      inventoryItems: inventoryItems.map((item) =>
        this.toGrpcInventoryItem(item),
      ),
    };
  }

  async listInventoryTransactions(page = 1) {
    const currentPage = page > 0 ? page : 1;
    const [transactions, totalItems] =
      await this.inventoryTransactionRepository.findAndCount({
        relations: {
          warehouse: true,
          location: true,
          product: true,
        },
        order: { createdAt: 'DESC' },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });

    return {
      inventoryTransactions: transactions.map((transaction) =>
        this.toGrpcInventoryTransaction(transaction),
      ),
      page: currentPage,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
    };
  }

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

  private toGrpcInventoryItem(item: InventoryItem): InventoryItemGrpc {
    return {
      inventoryId: item.inventoryId,
      warehouseId: item.warehouseId,
      warehouseCode: item.warehouse.warehouseCode,
      warehouseName: item.warehouse.warehouseName,
      locationId: item.locationId,
      locationZone: item.location.zone,
      productId: item.productId,
      productSku: item.product.sku,
      productName: item.product.productName,
      productUnit: item.product.unit,
      quantity: item.quantity,
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  private toGrpcInventoryTransaction(
    transaction: InventoryTransaction,
  ): InventoryTransactionGrpc {
    return {
      transactionId: transaction.transactionId,
      productId: transaction.productId,
      productSku: transaction.product.sku,
      productName: transaction.product.productName,
      productUnit: transaction.product.unit,
      warehouseId: transaction.warehouseId,
      warehouseCode: transaction.warehouse.warehouseCode,
      warehouseName: transaction.warehouse.warehouseName,
      locationId: transaction.locationId,
      locationZone: transaction.location.zone,
      transactionType: transaction.transactionType,
      quantity: transaction.quantity,
      referenceNo: transaction.referenceNo,
      createdBy: transaction.createdBy,
      createdAt: transaction.createdAt.toISOString(),
    };
  }
}
