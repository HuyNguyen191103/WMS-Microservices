import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateWarehouseGrpcRequest,
  CreateWarehouseLocationGrpcRequest,
  DeleteWarehouseGrpcRequest,
  DeleteWarehouseLocationGrpcRequest,
  GetWarehouseGrpcRequest,
  GetWarehouseLocationGrpcRequest,
  ListWarehouseLocationsGrpcRequest,
  ListWarehousesGrpcRequest,
  UpdateWarehouseGrpcRequest,
  UpdateWarehouseLocationGrpcRequest,
} from './grpc/warehouse-grpc.types';
import { WarehouseService } from './warehouse.service';

@Controller()
export class WarehouseGrpcController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @GrpcMethod('WarehouseApi', 'CreateWarehouse')
  createWarehouse(request: CreateWarehouseGrpcRequest) {
    return this.warehouseService.createWarehouse(request);
  }

  @GrpcMethod('WarehouseApi', 'ListWarehouses')
  listWarehouses(_request: ListWarehousesGrpcRequest) {
    return this.warehouseService.listWarehouses();
  }

  @GrpcMethod('WarehouseApi', 'GetWarehouse')
  getWarehouse(request: GetWarehouseGrpcRequest) {
    return this.warehouseService.getWarehouse(request);
  }

  @GrpcMethod('WarehouseApi', 'UpdateWarehouse')
  updateWarehouse(request: UpdateWarehouseGrpcRequest) {
    return this.warehouseService.updateWarehouse(request);
  }

  @GrpcMethod('WarehouseApi', 'DeleteWarehouse')
  deleteWarehouse(request: DeleteWarehouseGrpcRequest) {
    return this.warehouseService.deleteWarehouse(request);
  }

  @GrpcMethod('WarehouseApi', 'CreateWarehouseLocation')
  createWarehouseLocation(request: CreateWarehouseLocationGrpcRequest) {
    return this.warehouseService.createWarehouseLocation(request);
  }

  @GrpcMethod('WarehouseApi', 'ListWarehouseLocations')
  listWarehouseLocations(request: ListWarehouseLocationsGrpcRequest) {
    return this.warehouseService.listWarehouseLocations(request);
  }

  @GrpcMethod('WarehouseApi', 'GetWarehouseLocation')
  getWarehouseLocation(request: GetWarehouseLocationGrpcRequest) {
    return this.warehouseService.getWarehouseLocation(request);
  }

  @GrpcMethod('WarehouseApi', 'UpdateWarehouseLocation')
  updateWarehouseLocation(request: UpdateWarehouseLocationGrpcRequest) {
    return this.warehouseService.updateWarehouseLocation(request);
  }

  @GrpcMethod('WarehouseApi', 'DeleteWarehouseLocation')
  deleteWarehouseLocation(request: DeleteWarehouseLocationGrpcRequest) {
    return this.warehouseService.deleteWarehouseLocation(request);
  }
}
