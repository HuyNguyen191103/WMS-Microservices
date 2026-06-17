export interface ActorGrpcRequest {
  actorUsername: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface InboundItemInputGrpc {
  productId: string;
  locationId: string;
  actualQty: number;
}

export interface CreateInboundGrpcRequest extends ActorGrpcRequest {
  inboundNo: string;
  warehouseId: string;
  supplierName?: string;
  actualDate?: string;
  items: InboundItemInputGrpc[];
}

export interface ListInboundsGrpcRequest {}

export interface GetInboundGrpcRequest {
  inboundOrderId: string;
}

export interface UpdateInboundGrpcRequest extends ActorGrpcRequest {
  inboundOrderId: string;
  inboundNo?: string;
  warehouseId?: string;
  supplierName?: string;
  actualDate?: string;
  items?: InboundItemInputGrpc[];
}

export interface CompleteInboundGrpcRequest extends ActorGrpcRequest {
  inboundOrderId: string;
}

export interface DeleteInboundGrpcRequest extends ActorGrpcRequest {
  inboundOrderId: string;
}

export interface InboundItemGrpc {
  inboundItemId?: string;
  inboundOrderId?: string;
  productId?: string;
  locationId?: string;
  actualQty?: number;
}

export interface InboundGrpc {
  inboundOrderId?: string;
  inboundNo?: string;
  warehouseId?: string;
  supplierName?: string;
  actualDate?: string;
  status: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  items?: InboundItemGrpc[];
}

export interface InboundGrpcResponse {
  inbound: InboundGrpc;
}

export interface ListInboundsGrpcResponse {
  inbounds: InboundGrpc[];
}
