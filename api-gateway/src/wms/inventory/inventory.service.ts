import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import {
  InventoryGrpcClient,
  InventoryItemGrpc,
  InventoryTransactionGrpc,
} from '../grpc/inventory-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';

@Injectable()
export class InventoryService implements OnModuleInit {
  private readonly logger = new Logger(InventoryService.name);
  private inventoryGrpcClient!: InventoryGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
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
      throw this.toHttpException(error);
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
      throw this.toHttpException(error);
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

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `WMS Inventory gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'WMS inventory request failed';

    if (grpcError.code === status.INVALID_ARGUMENT) {
      return new BadRequestException(message);
    }

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
