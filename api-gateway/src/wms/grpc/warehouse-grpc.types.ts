import { Observable } from 'rxjs';

export interface WarehouseGrpcClient {
  createWarehouse(
    request: CreateWarehouseGrpcRequest,
  ): Observable<WarehouseGrpcResponse>;
  listWarehouses(
    request: ListWarehousesGrpcRequest,
  ): Observable<ListWarehousesGrpcResponse>;
  getWarehouse(
    request: GetWarehouseGrpcRequest,
  ): Observable<WarehouseGrpcResponse>;
  updateWarehouse(
    request: UpdateWarehouseGrpcRequest,
  ): Observable<WarehouseGrpcResponse>;
  deleteWarehouse(
    request: DeleteWarehouseGrpcRequest,
  ): Observable<WarehouseGrpcResponse>;
  createWarehouseLocation(
    request: CreateWarehouseLocationGrpcRequest,
  ): Observable<WarehouseLocationGrpcResponse>;
  listWarehouseLocations(
    request: ListWarehouseLocationsGrpcRequest,
  ): Observable<ListWarehouseLocationsGrpcResponse>;
  getWarehouseLocation(
    request: GetWarehouseLocationGrpcRequest,
  ): Observable<WarehouseLocationGrpcResponse>;
  updateWarehouseLocation(
    request: UpdateWarehouseLocationGrpcRequest,
  ): Observable<WarehouseLocationGrpcResponse>;
  deleteWarehouseLocation(
    request: DeleteWarehouseLocationGrpcRequest,
  ): Observable<WarehouseLocationGrpcResponse>;
}

export interface ActorGrpcRequest {
  actorUsername: string;
  actorUserId: string;
  actorRole: string;
}

export interface CreateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseCode: string;
  warehouseName: string;
  address?: string;
}

export interface ListWarehousesGrpcRequest {}

export interface GetWarehouseGrpcRequest {
  warehouseId: string;
}

export interface UpdateWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId: string;
  warehouseCode?: string;
  warehouseName?: string;
  address?: string;
}

export interface DeleteWarehouseGrpcRequest extends ActorGrpcRequest {
  warehouseId: string;
}

export interface CreateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  warehouseId: string;
  zone?: string;
}

export interface ListWarehouseLocationsGrpcRequest {
  warehouseId?: string;
}

export interface GetWarehouseLocationGrpcRequest {
  locationId: string;
}

export interface UpdateWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId: string;
  warehouseId?: string;
  zone?: string;
}

export interface DeleteWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId: string;
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

export interface WarehouseGrpcResponse {
  warehouse?: WarehouseGrpc;
}

export interface ListWarehousesGrpcResponse {
  warehouses?: WarehouseGrpc[];
}

export interface WarehouseLocationGrpcResponse {
  location?: WarehouseLocationGrpc;
}

export interface ListWarehouseLocationsGrpcResponse {
  locations?: WarehouseLocationGrpc[];
}
