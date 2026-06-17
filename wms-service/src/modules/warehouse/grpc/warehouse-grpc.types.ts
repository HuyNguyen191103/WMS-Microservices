export interface ActorGrpcRequest {
  actorUsername?: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface CreateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
}

export interface ListWarehousesGrpcRequest {}

export interface GetWarehouseGrpcRequest {
  warehouseId?: string;
}

export interface UpdateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
}

export interface DeleteWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
}

export interface CreateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
  zone?: string;
}

export interface ListWarehouseLocationsGrpcRequest {
  warehouseId?: string;
}

export interface GetWarehouseLocationGrpcRequest {
  locationId?: string;
}

export interface UpdateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId?: string;
  warehouseId?: string;
  zone?: string;
}

export interface DeleteWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId?: string;
}

export interface WarehouseGrpc {
  warehouseId?: string;
  warehouseCode?: string;
  warehouseName?: string;
  address: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WarehouseLocationGrpc {
  locationId?: string;
  warehouseId?: string;
  zone: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}
