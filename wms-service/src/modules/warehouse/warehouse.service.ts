import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { WarehouseLocation } from './entities/warehouse-location.entity';
import { Warehouse } from './entities/warehouse.entity';
import {
  ActorGrpcRequest,
  CreateWarehouseGrpcRequest,
  CreateWarehouseLocationGrpcRequest,
  DeleteWarehouseGrpcRequest,
  DeleteWarehouseLocationGrpcRequest,
  GetWarehouseGrpcRequest,
  GetWarehouseLocationGrpcRequest,
  ListWarehouseLocationsGrpcRequest,
  UpdateWarehouseGrpcRequest,
  UpdateWarehouseLocationGrpcRequest,
  WarehouseGrpc,
  WarehouseLocationGrpc,
} from './grpc/warehouse-grpc.types';

const ACTIVE_STATUS = 'ACTIVE';
const DELETED_STATUS = 'DELETE';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private readonly warehouseRepository: Repository<Warehouse>,
    @InjectRepository(WarehouseLocation)
    private readonly locationRepository: Repository<WarehouseLocation>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createWarehouse(request: CreateWarehouseGrpcRequest) {
    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const warehouseCode = request.warehouseCode ?? '';
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { warehouseCode },
    });

    if (existingWarehouse?.status === ACTIVE_STATUS) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Warehouse code already exists',
      });
    }

    const warehouse = existingWarehouse ?? this.warehouseRepository.create();
    warehouse.warehouseCode = warehouseCode;
    warehouse.warehouseName = request.warehouseName ?? '';
    warehouse.address = request.address || '';
    warehouse.status = ACTIVE_STATUS;
    warehouse.createdBy = actorUsername;
    warehouse.updatedBy = actorUsername;
    warehouse.createdAt = now;
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);

    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_CREATE',
      referenceType: 'WAREHOUSE',
      referenceId: savedWarehouse.warehouseId,
      description: existingWarehouse
        ? `Overwrote warehouse ${savedWarehouse.warehouseCode}`
        : `Created warehouse ${savedWarehouse.warehouseCode}`,
    });

    return { warehouse: this.toGrpcWarehouse(savedWarehouse) };
  }

  async listWarehouses() {
    const warehouses = await this.warehouseRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      warehouses: warehouses.map((warehouse) =>
        this.toGrpcWarehouse(warehouse),
      ),
    };
  }

  async getWarehouse(request: GetWarehouseGrpcRequest) {
    const warehouse = await this.findWarehouse(this.getWarehouseId(request));

    return { warehouse: this.toGrpcWarehouse(warehouse) };
  }

  async updateWarehouse(request: UpdateWarehouseGrpcRequest) {
    const warehouse = await this.findWarehouse(this.getWarehouseId(request));
    const now = new Date();

    warehouse.warehouseCode = request.warehouseCode ?? warehouse.warehouseCode;
    warehouse.warehouseName =
      request.warehouseName ?? warehouse.warehouseName;
    warehouse.address =
      request.address === undefined ? warehouse.address : request.address || '';
    warehouse.updatedBy = this.getActorUsername(request);
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_UPDATE',
      referenceType: 'WAREHOUSE',
      referenceId: savedWarehouse.warehouseId,
      description: `Updated warehouse ${savedWarehouse.warehouseCode}`,
    });

    return { warehouse: this.toGrpcWarehouse(savedWarehouse) };
  }

  async deleteWarehouse(request: DeleteWarehouseGrpcRequest) {
    const warehouse = await this.findWarehouse(this.getWarehouseId(request));
    const now = new Date();

    warehouse.status = DELETED_STATUS;
    warehouse.updatedBy = this.getActorUsername(request);
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_DELETE',
      referenceType: 'WAREHOUSE',
      referenceId: savedWarehouse.warehouseId,
      description: `Deleted warehouse ${savedWarehouse.warehouseCode}`,
    });

    return { warehouse: this.toGrpcWarehouse(savedWarehouse) };
  }

  async createWarehouseLocation(request: CreateWarehouseLocationGrpcRequest) {
    const warehouseId = this.getWarehouseId(request);
    await this.findWarehouse(warehouseId);

    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const location = this.locationRepository.create({
      warehouseId,
      zone: request.zone || '',
      status: ACTIVE_STATUS,
      createdBy: actorUsername,
      updatedBy: actorUsername,
      createdAt: now,
      updatedAt: now,
    });
    const savedLocation = await this.locationRepository.save(location);

    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_LOCATION_CREATE',
      referenceType: 'WAREHOUSE_LOCATION',
      referenceId: savedLocation.locationId,
      description: `Created warehouse location ${savedLocation.zone ?? ''}`,
    });

    return { location: this.toGrpcWarehouseLocation(savedLocation) };
  }

  async listWarehouseLocations(request: ListWarehouseLocationsGrpcRequest) {
    const warehouseId = request.warehouseId;
    const locations = await this.locationRepository.find({
      where: warehouseId ? { warehouseId } : {},
      order: { createdAt: 'DESC' },
    });

    return {
      locations: locations.map((location) =>
        this.toGrpcWarehouseLocation(location),
      ),
    };
  }

  async getWarehouseLocation(request: GetWarehouseLocationGrpcRequest) {
    const location = await this.findWarehouseLocation(
      this.getLocationId(request),
    );

    return { location: this.toGrpcWarehouseLocation(location) };
  }

  async updateWarehouseLocation(request: UpdateWarehouseLocationGrpcRequest) {
    const location = await this.findWarehouseLocation(
      this.getLocationId(request),
    );
    const warehouseId = request.warehouseId;
    if (warehouseId) {
      await this.findWarehouse(warehouseId);
      location.warehouseId = warehouseId;
    }

    location.zone =
      request.zone === undefined ? location.zone : request.zone || '';
    location.updatedBy = this.getActorUsername(request);
    location.updatedAt = new Date();

    const savedLocation = await this.locationRepository.save(location);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_LOCATION_UPDATE',
      referenceType: 'WAREHOUSE_LOCATION',
      referenceId: savedLocation.locationId,
      description: `Updated warehouse location ${savedLocation.zone ?? ''}`,
    });

    return { location: this.toGrpcWarehouseLocation(savedLocation) };
  }

  async deleteWarehouseLocation(request: DeleteWarehouseLocationGrpcRequest) {
    const location = await this.findWarehouseLocation(
      this.getLocationId(request),
    );

    location.status = DELETED_STATUS;
    location.updatedBy = this.getActorUsername(request);
    location.updatedAt = new Date();

    const savedLocation = await this.locationRepository.save(location);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'WAREHOUSE_LOCATION_DELETE',
      referenceType: 'WAREHOUSE_LOCATION',
      referenceId: savedLocation.locationId,
      description: `Deleted warehouse location ${savedLocation.zone ?? ''}`,
    });

    return { location: this.toGrpcWarehouseLocation(savedLocation) };
  }

  private async findWarehouse(warehouseId: string) {
    const warehouse = await this.warehouseRepository.findOne({
      where: { warehouseId },
    });

    if (!warehouse) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Warehouse not found',
      });
    }

    return warehouse;
  }

  private async findWarehouseLocation(locationId: string) {
    const location = await this.locationRepository.findOne({
      where: { locationId },
    });

    if (!location) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Warehouse location not found',
      });
    }

    return location;
  }

  private getWarehouseId(
    request:
      | GetWarehouseGrpcRequest
      | UpdateWarehouseGrpcRequest
      | DeleteWarehouseGrpcRequest
      | CreateWarehouseLocationGrpcRequest,
  ) {
    const warehouseId = request.warehouseId;

    if (!warehouseId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse id is required',
      });
    }

    return warehouseId;
  }

  private getLocationId(
    request:
      | GetWarehouseLocationGrpcRequest
      | UpdateWarehouseLocationGrpcRequest
      | DeleteWarehouseLocationGrpcRequest,
  ) {
    const locationId = request.locationId;

    if (!locationId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse location id is required',
      });
    }

    return locationId;
  }

  private getActorUsername(request: ActorGrpcRequest) {
    return request.actorUsername ?? '';
  }

  private toGrpcWarehouse(warehouse: Warehouse): WarehouseGrpc {
    return {
      warehouseId: warehouse.warehouseId,
      warehouseCode: warehouse.warehouseCode,
      warehouseName: warehouse.warehouseName,
      address: warehouse.address ?? '',
      status: warehouse.status ?? '',
      createdBy: warehouse.createdBy ?? '',
      updatedBy: warehouse.updatedBy ?? '',
      createdAt: warehouse.createdAt?.toISOString() ?? '',
      updatedAt: warehouse.updatedAt?.toISOString() ?? '',
    };
  }

  private toGrpcWarehouseLocation(
    location: WarehouseLocation,
  ): WarehouseLocationGrpc {
    return {
      locationId: location.locationId,
      warehouseId: location.warehouseId,
      zone: location.zone ?? '',
      status: location.status ?? '',
      createdBy: location.createdBy ?? '',
      updatedBy: location.updatedBy ?? '',
      createdAt: location.createdAt?.toISOString() ?? '',
      updatedAt: location.updatedAt?.toISOString() ?? '',
    };
  }
}
