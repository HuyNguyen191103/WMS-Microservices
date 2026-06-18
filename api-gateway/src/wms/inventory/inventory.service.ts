import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  InventoryGrpcClient,
  InventoryItemGrpc,
  InventoryTransactionGrpc,
} from '../grpc/inventory-grpc.types';
import { WmsGrpcExceptionMapper } from '../grpc/wms-grpc-exception.mapper';
import { WMS_GRPC_CLIENT } from '../wms.constants';

@Injectable()
export class InventoryService implements OnModuleInit {
  private inventoryGrpcClient!: InventoryGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
    private readonly exceptionMapper: WmsGrpcExceptionMapper,
  ) {}

  onModuleInit() {
    this.inventoryGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<InventoryGrpcClient>('InventoryApi');
  }

  async listInventoryItems(warehouseId: string) {
    try {
      const response = await firstValueFrom(
        this.inventoryGrpcClient.listInventoryItems({ warehouseId }),
      );

      return {
        inventory_items: (response.inventoryItems ?? []).map((item) =>
          this.toInventoryItemResponse(item),
        ),
      };
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  async listInventoryTransactions(page: number) {
    try {
      const response = await firstValueFrom(
        this.inventoryGrpcClient.listInventoryTransactions({ page }),
      );

      return {
        inventory_transactions: (response.inventoryTransactions ?? []).map(
          (transaction) => this.toInventoryTransactionResponse(transaction),
        ),
        pagination: {
          page: response.page ?? page,
          page_size: response.pageSize ?? 20,
          total_items: response.totalItems ?? 0,
          total_pages: response.totalPages ?? 0,
        },
      };
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  private toInventoryItemResponse(item: InventoryItemGrpc) {
    return {
      inventory_id: item.inventoryId ?? '',
      warehouse_id: item.warehouseId ?? '',
      warehouse_code: item.warehouseCode ?? '',
      warehouse_name: item.warehouseName ?? '',
      location_id: item.locationId ?? '',
      location_zone: item.locationZone ?? '',
      product_id: item.productId ?? '',
      product_sku: item.productSku ?? '',
      product_name: item.productName ?? '',
      product_unit: item.productUnit ?? '',
      quantity: item.quantity ?? 0,
      updated_at: item.updatedAt ?? '',
    };
  }

  private toInventoryTransactionResponse(
    transaction: InventoryTransactionGrpc,
  ) {
    return {
      transaction_id: transaction.transactionId ?? '',
      product_id: transaction.productId ?? '',
      product_sku: transaction.productSku ?? '',
      product_name: transaction.productName ?? '',
      product_unit: transaction.productUnit ?? '',
      warehouse_id: transaction.warehouseId ?? '',
      warehouse_code: transaction.warehouseCode ?? '',
      warehouse_name: transaction.warehouseName ?? '',
      location_id: transaction.locationId ?? '',
      location_zone: transaction.locationZone ?? '',
      transaction_type: transaction.transactionType ?? '',
      quantity: transaction.quantity ?? 0,
      reference_no: transaction.referenceNo ?? '',
      created_by: transaction.createdBy ?? '',
      created_at: transaction.createdAt ?? '',
    };
  }

  private mapGrpcError(error: unknown) {
    return this.exceptionMapper.toHttpException(error, {
      domain: 'Inventory',
      fallbackMessage: 'WMS inventory request failed',
    });
  }
}
