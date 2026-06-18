export interface ListInventoryItemsGrpcRequest {
  warehouseId?: string;
}

export interface ListInventoryTransactionsGrpcRequest {
  page?: number;
}

export interface InventoryItemGrpc {
  inventoryId: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  locationId: string;
  locationZone: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  quantity: number;
  updatedAt: string;
}

export interface InventoryTransactionGrpc {
  transactionId: string;
  productId: string;
  productSku: string;
  productName: string;
  productUnit: string;
  warehouseId: string;
  warehouseCode: string;
  warehouseName: string;
  locationId: string;
  locationZone: string;
  transactionType: string;
  quantity: number;
  referenceNo: string;
  createdBy: string;
  createdAt: string;
}
