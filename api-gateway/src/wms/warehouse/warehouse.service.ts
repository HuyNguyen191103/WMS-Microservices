import {
  BadGatewayException,
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser } from '../../auth/authenticated-user.interface';
import {
  ListWarehouseLocationsGrpcResponse,
  ListWarehousesGrpcResponse,
  WarehouseGrpc,
  WarehouseGrpcClient,
  WarehouseGrpcResponse,
  WarehouseLocationGrpc,
  WarehouseLocationGrpcResponse,
} from '../grpc/warehouse-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehouseService implements OnModuleInit {
  private readonly logger = new Logger(WarehouseService.name);
  private warehouseGrpcClient!: WarehouseGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
  ) {}

  onModuleInit() {
    this.warehouseGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<WarehouseGrpcClient>('WarehouseApi');
  }

  async createWarehouse(user: AuthenticatedUser, body: CreateWarehouseDto) {
    return this.handleWarehouseGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.createWarehouse({
          warehouseCode: body.warehouseCode,
          warehouseName: body.warehouseName,
          address: body.address,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async listWarehouses() {
    const response = await this.handleListWarehousesGrpcRequest(
      firstValueFrom(this.warehouseGrpcClient.listWarehouses({})),
    );

    return {
      warehouses: (response.warehouses ?? []).map((warehouse) =>
        this.toWarehouseResponse(warehouse),
      ),
    };
  }

  async getWarehouse(warehouseId: string) {
    return this.handleWarehouseGrpcRequest(
      firstValueFrom(this.warehouseGrpcClient.getWarehouse({ warehouseId })),
    );
  }

  async updateWarehouse(
    user: AuthenticatedUser,
    warehouseId: string,
    body: UpdateWarehouseDto,
  ) {
    return this.handleWarehouseGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.updateWarehouse({
          warehouseId,
          warehouseCode: body.warehouseCode,
          warehouseName: body.warehouseName,
          address: body.address,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async deleteWarehouse(user: AuthenticatedUser, warehouseId: string) {
    return this.handleWarehouseGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.deleteWarehouse({
          warehouseId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async restoreWarehouse(user: AuthenticatedUser, warehouseId: string) {
    return this.handleWarehouseGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.restoreWarehouse({
          warehouseId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async createWarehouseLocation(
    user: AuthenticatedUser,
    body: CreateWarehouseLocationDto,
  ) {
    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.createWarehouseLocation({
          warehouseId: body.warehouseId,
          zone: body.zone,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async listWarehouseLocations(warehouseId?: string) {
    const response = await this.handleListWarehouseLocationsGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.listWarehouseLocations({ warehouseId }),
      ),
    );

    return {
      locations: (response.locations ?? []).map((location) =>
        this.toWarehouseLocationResponse(location),
      ),
    };
  }

  async getWarehouseLocation(locationId: string) {
    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.getWarehouseLocation({ locationId }),
      ),
    );
  }

  async updateWarehouseLocation(
    user: AuthenticatedUser,
    locationId: string,
    body: UpdateWarehouseLocationDto,
  ) {
    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.updateWarehouseLocation({
          locationId,
          warehouseId: body.warehouseId,
          zone: body.zone,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async deleteWarehouseLocation(user: AuthenticatedUser, locationId: string) {
    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.deleteWarehouseLocation({
          locationId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async restoreWarehouseLocation(user: AuthenticatedUser, locationId: string) {
    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.restoreWarehouseLocation({
          locationId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  private toActorRequest(user: AuthenticatedUser) {
    return {
      actorUsername: user.username,
      actorUserId: user.user_id,
      actorRole: user.roles[0] ?? '',
    };
  }

  private async handleWarehouseGrpcRequest<T extends WarehouseGrpcResponse>(
    request: Promise<T>,
  ) {
    try {
      const response = await request;

      return {
        warehouse: this.toWarehouseResponse(response.warehouse),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async handleWarehouseLocationGrpcRequest<
    T extends WarehouseLocationGrpcResponse,
  >(request: Promise<T>) {
    try {
      const response = await request;

      return {
        location: this.toWarehouseLocationResponse(response.location),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async handleListWarehousesGrpcRequest<
    T extends ListWarehousesGrpcResponse,
  >(request: Promise<T>) {
    try {
      return await request;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async handleListWarehouseLocationsGrpcRequest<
    T extends ListWarehouseLocationsGrpcResponse,
  >(request: Promise<T>) {
    try {
      return await request;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toWarehouseResponse(warehouse?: WarehouseGrpc) {
    if (!warehouse) {
      return null;
    }

    return {
      warehouse_id: warehouse.warehouseId ?? '',
      warehouse_code: warehouse.warehouseCode ?? '',
      warehouse_name: warehouse.warehouseName ?? '',
      address: warehouse.address,
      status: warehouse.status,
      created_by: warehouse.createdBy ?? '',
      updated_by: warehouse.updatedBy ?? '',
      created_at: warehouse.createdAt ?? '',
      updated_at: warehouse.updatedAt ?? '',
    };
  }

  private toWarehouseLocationResponse(location?: WarehouseLocationGrpc) {
    if (!location) {
      return null;
    }

    return {
      location_id: location.locationId ?? '',
      warehouse_id: location.warehouseId ?? '',
      zone: location.zone,
      status: location.status,
      created_by: location.createdBy ?? '',
      updated_by: location.updatedBy ?? '',
      created_at: location.createdAt ?? '',
      updated_at: location.updatedAt ?? '',
    };
  }

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `WMS Warehouse gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'WMS warehouse request failed';

    if (grpcError.code === status.INVALID_ARGUMENT) {
      return new BadRequestException(message);
    }

    if (grpcError.code === status.NOT_FOUND) {
      return new NotFoundException(message);
    }

    if (grpcError.code === status.ALREADY_EXISTS) {
      return new ConflictException(message);
    }

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
