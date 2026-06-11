export interface ActorGrpcRequest {
  actorUsername?: string;
  actor_username?: string;
  actorUserId?: string;
  actor_user_id?: string;
  actorRole?: string;
  actor_role?: string;
}

export interface CreateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseCode?: string;
  warehouse_code?: string;
  warehouseName?: string;
  warehouse_name?: string;
  address?: string;
}

export interface ListWarehousesGrpcRequest {}

export interface GetWarehouseGrpcRequest {
  warehouseId?: string;
  warehouse_id?: string;
}

export interface UpdateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
  warehouse_id?: string;
  warehouseCode?: string;
  warehouse_code?: string;
  warehouseName?: string;
  warehouse_name?: string;
  address?: string;
}

export interface DeleteWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
  warehouse_id?: string;
}

export interface CreateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  warehouseId?: string;
  warehouse_id?: string;
  zone?: string;
}

export interface ListWarehouseLocationsGrpcRequest {
  warehouseId?: string;
  warehouse_id?: string;
}

export interface GetWarehouseLocationGrpcRequest {
  locationId?: string;
  location_id?: string;
}

export interface UpdateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId?: string;
  location_id?: string;
  warehouseId?: string;
  warehouse_id?: string;
  zone?: string;
}

export interface DeleteWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId?: string;
  location_id?: string;
}

export interface WarehouseGrpc {
  warehouseId?: string;
  warehouse_id?: string;
  warehouseCode?: string;
  warehouse_code?: string;
  warehouseName?: string;
  warehouse_name?: string;
  address: string;
  status: string;
  createdBy?: string;
  created_by?: string;
  updatedBy?: string;
  updated_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface WarehouseLocationGrpc {
  locationId?: string;
  location_id?: string;
  warehouseId?: string;
  warehouse_id?: string;
  zone: string;
  status: string;
  createdBy?: string;
  created_by?: string;
  updatedBy?: string;
  updated_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}
