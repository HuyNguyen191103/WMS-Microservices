import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  ListInventoryItemsGrpcRequest,
  ListInventoryTransactionsGrpcRequest,
} from './grpc/inventory-grpc.types';
import { InventoryService } from './inventory.service';

@Controller()
export class InventoryGrpcController {
  constructor(private readonly inventoryService: InventoryService) {}

  @GrpcMethod('InventoryApi', 'ListInventoryItems')
  listInventoryItems(request: ListInventoryItemsGrpcRequest) {
    return this.inventoryService.listInventoryItems(request);
  }

  @GrpcMethod('InventoryApi', 'ListInventoryTransactions')
  listInventoryTransactions(request: ListInventoryTransactionsGrpcRequest) {
    return this.inventoryService.listInventoryTransactions(request.page ?? 1);
  }
}
