import { Controller } from '@nestjs/common';
import {
  InventoryApiController,
  InventoryApiControllerMethods,
  ListInventoryItemsRequest as ListInventoryItemsGrpcRequest,
  ListInventoryTransactionsRequest as ListInventoryTransactionsGrpcRequest,
} from '../../generated/wms';
import { InventoryService } from './inventory.service';

@Controller()
@InventoryApiControllerMethods()
export class InventoryGrpcController implements InventoryApiController {
  constructor(private readonly inventoryService: InventoryService) {}

  listInventoryItems(request: ListInventoryItemsGrpcRequest) {
    return this.inventoryService.listInventoryItems(request);
  }

  listInventoryTransactions(request: ListInventoryTransactionsGrpcRequest) {
    return this.inventoryService.listInventoryTransactions(request.page ?? 1);
  }
}
