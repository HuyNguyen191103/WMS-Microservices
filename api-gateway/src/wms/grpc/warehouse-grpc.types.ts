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
  restoreWarehouse(
    request: RestoreWarehouseGrpcRequest,
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
  restoreWarehouseLocation(
    request: RestoreWarehouseLocationGrpcRequest,
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

export interface RestoreWarehouseGrpcRequest extends ActorGrpcRequest {
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

export interface RestoreWarehouseLocationGrpcRequest extends ActorGrpcRequest {
  locationId: string;
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
