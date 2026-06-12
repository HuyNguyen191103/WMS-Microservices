import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../activity-log/entities/activity-log.entity';
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
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async createWarehouse(request: CreateWarehouseGrpcRequest) {
    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const warehouseCode = request.warehouseCode ?? request.warehouse_code ?? '';
    const existingWarehouse = await this.warehouseRepository.findOne({
      where: { warehouseCode },
    });

    const warehouse = existingWarehouse ?? this.warehouseRepository.create();
    warehouse.warehouseCode = warehouseCode;
    warehouse.warehouseName = request.warehouseName ?? request.warehouse_name ?? '';
    warehouse.address = request.address || null;
    warehouse.status = ACTIVE_STATUS;
    warehouse.createdBy = actorUsername;
    warehouse.updatedBy = actorUsername;
    warehouse.createdAt = now;
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);

    await this.createActivityLog(
      request,
      'WAREHOUSE_CREATE',
      savedWarehouse.warehouseId,
      existingWarehouse
        ? `Overwrote warehouse ${savedWarehouse.warehouseCode}`
        : `Created warehouse ${savedWarehouse.warehouseCode}`,
      'WAREHOUSE',
    );

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

    warehouse.warehouseCode =
      request.warehouseCode ?? request.warehouse_code ?? warehouse.warehouseCode;
    warehouse.warehouseName =
      request.warehouseName ?? request.warehouse_name ?? warehouse.warehouseName;
    warehouse.address =
      request.address === undefined ? warehouse.address : request.address || null;
    warehouse.updatedBy = this.getActorUsername(request);
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    await this.createActivityLog(
      request,
      'WAREHOUSE_UPDATE',
      savedWarehouse.warehouseId,
      `Updated warehouse ${savedWarehouse.warehouseCode}`,
      'WAREHOUSE',
    );

    return { warehouse: this.toGrpcWarehouse(savedWarehouse) };
  }

  async deleteWarehouse(request: DeleteWarehouseGrpcRequest) {
    const warehouse = await this.findWarehouse(this.getWarehouseId(request));
    const now = new Date();

    warehouse.status = DELETED_STATUS;
    warehouse.updatedBy = this.getActorUsername(request);
    warehouse.updatedAt = now;

    const savedWarehouse = await this.warehouseRepository.save(warehouse);
    await this.createActivityLog(
      request,
      'WAREHOUSE_DELETE',
      savedWarehouse.warehouseId,
      `Deleted warehouse ${savedWarehouse.warehouseCode}`,
      'WAREHOUSE',
    );

    return { warehouse: this.toGrpcWarehouse(savedWarehouse) };
  }

  async createWarehouseLocation(request: CreateWarehouseLocationGrpcRequest) {
    const warehouseId = this.getWarehouseId(request);
    await this.findWarehouse(warehouseId);

    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const location = this.locationRepository.create({
      warehouseId,
      zone: request.zone || null,
      status: ACTIVE_STATUS,
      createdBy: actorUsername,
      updatedBy: actorUsername,
      createdAt: now,
      updatedAt: now,
    });
    const savedLocation = await this.locationRepository.save(location);

    await this.createActivityLog(
      request,
      'WAREHOUSE_LOCATION_CREATE',
      savedLocation.locationId,
      `Created warehouse location ${savedLocation.zone ?? ''}`,
      'WAREHOUSE_LOCATION',
    );

    return { location: this.toGrpcWarehouseLocation(savedLocation) };
  }

  async listWarehouseLocations(request: ListWarehouseLocationsGrpcRequest) {
    const warehouseId = request.warehouseId ?? request.warehouse_id;
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
    const location = await this.findWarehouseLocation(this.getLocationId(request));

    return { location: this.toGrpcWarehouseLocation(location) };
  }

  async updateWarehouseLocation(request: UpdateWarehouseLocationGrpcRequest) {
    const location = await this.findWarehouseLocation(this.getLocationId(request));
    const warehouseId = request.warehouseId ?? request.warehouse_id;
    if (warehouseId) {
      await this.findWarehouse(warehouseId);
      location.warehouseId = warehouseId;
    }

    location.zone = request.zone === undefined ? location.zone : request.zone || null;
    location.updatedBy = this.getActorUsername(request);
    location.updatedAt = new Date();

    const savedLocation = await this.locationRepository.save(location);
    await this.createActivityLog(
      request,
      'WAREHOUSE_LOCATION_UPDATE',
      savedLocation.locationId,
      `Updated warehouse location ${savedLocation.zone ?? ''}`,
      'WAREHOUSE_LOCATION',
    );

    return { location: this.toGrpcWarehouseLocation(savedLocation) };
  }

  async deleteWarehouseLocation(request: DeleteWarehouseLocationGrpcRequest) {
    const location = await this.findWarehouseLocation(this.getLocationId(request));

    location.status = DELETED_STATUS;
    location.updatedBy = this.getActorUsername(request);
    location.updatedAt = new Date();

    const savedLocation = await this.locationRepository.save(location);
    await this.createActivityLog(
      request,
      'WAREHOUSE_LOCATION_DELETE',
      savedLocation.locationId,
      `Deleted warehouse location ${savedLocation.zone ?? ''}`,
      'WAREHOUSE_LOCATION',
    );

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

  private async createActivityLog(
    request: ActorGrpcRequest,
    action: string,
    referenceId: string,
    description: string,
    referenceType: string,
  ) {
    await this.activityLogRepository.save(
      this.activityLogRepository.create({
        userId: request.actorUserId ?? request.actor_user_id ?? null,
        username: this.getActorUsername(request),
        action,
        referenceType,
        referenceId,
        description,
        createdAt: new Date(),
      }),
    );
  }

  private getWarehouseId(
    request:
      | GetWarehouseGrpcRequest
      | UpdateWarehouseGrpcRequest
      | DeleteWarehouseGrpcRequest
      | CreateWarehouseLocationGrpcRequest,
  ) {
    const warehouseId = request.warehouseId ?? request.warehouse_id;

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
    const locationId = request.locationId ?? request.location_id;

    if (!locationId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse location id is required',
      });
    }

    return locationId;
  }

  private getActorUsername(request: ActorGrpcRequest) {
    return request.actorUsername ?? request.actor_username ?? null;
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
