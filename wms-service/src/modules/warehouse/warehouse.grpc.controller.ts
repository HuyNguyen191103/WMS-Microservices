import { Controller } from '@nestjs/common';
import {
  CreateWarehouseLocationRequest as CreateWarehouseLocationGrpcRequest,
  CreateWarehouseRequest as CreateWarehouseGrpcRequest,
  DeleteWarehouseLocationRequest as DeleteWarehouseLocationGrpcRequest,
  DeleteWarehouseRequest as DeleteWarehouseGrpcRequest,
  GetWarehouseLocationRequest as GetWarehouseLocationGrpcRequest,
  GetWarehouseRequest as GetWarehouseGrpcRequest,
  ListWarehouseLocationsRequest as ListWarehouseLocationsGrpcRequest,
  ListWarehousesRequest as ListWarehousesGrpcRequest,
  RestoreWarehouseLocationRequest as RestoreWarehouseLocationGrpcRequest,
  RestoreWarehouseRequest as RestoreWarehouseGrpcRequest,
  UpdateWarehouseLocationRequest as UpdateWarehouseLocationGrpcRequest,
  UpdateWarehouseRequest as UpdateWarehouseGrpcRequest,
  WarehouseApiController,
  WarehouseApiControllerMethods,
} from '../../generated/wms';
import { WarehouseService } from './warehouse.service';

@Controller()
@WarehouseApiControllerMethods()
export class WarehouseGrpcController implements WarehouseApiController {
  constructor(private readonly warehouseService: WarehouseService) {}

  createWarehouse(request: CreateWarehouseGrpcRequest) {
    return this.warehouseService.createWarehouse(request);
  }

  listWarehouses(_request: ListWarehousesGrpcRequest) {
    void _request;
    return this.warehouseService.listWarehouses();
  }

  getWarehouse(request: GetWarehouseGrpcRequest) {
    return this.warehouseService.getWarehouse(request);
  }

  updateWarehouse(request: UpdateWarehouseGrpcRequest) {
    return this.warehouseService.updateWarehouse(request);
  }

  deleteWarehouse(request: DeleteWarehouseGrpcRequest) {
    return this.warehouseService.deleteWarehouse(request);
  }

  restoreWarehouse(request: RestoreWarehouseGrpcRequest) {
    return this.warehouseService.restoreWarehouse(request);
  }

  createWarehouseLocation(request: CreateWarehouseLocationGrpcRequest) {
    return this.warehouseService.createWarehouseLocation(request);
  }

  listWarehouseLocations(request: ListWarehouseLocationsGrpcRequest) {
    return this.warehouseService.listWarehouseLocations(request);
  }

  getWarehouseLocation(request: GetWarehouseLocationGrpcRequest) {
    return this.warehouseService.getWarehouseLocation(request);
  }

  updateWarehouseLocation(request: UpdateWarehouseLocationGrpcRequest) {
    return this.warehouseService.updateWarehouseLocation(request);
  }

  deleteWarehouseLocation(request: DeleteWarehouseLocationGrpcRequest) {
    return this.warehouseService.deleteWarehouseLocation(request);
  }

  restoreWarehouseLocation(request: RestoreWarehouseLocationGrpcRequest) {
    return this.warehouseService.restoreWarehouseLocation(request);
  }
}
