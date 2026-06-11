import {
  BadGatewayException,
  BadRequestException,
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
import { AuthService } from '../../auth/auth.service';
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

const WRITE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

interface AuthenticatedUser {
  user_id: string;
  username: string;
  roles: string[];
}

@Injectable()
export class WarehouseService implements OnModuleInit {
  private readonly logger = new Logger(WarehouseService.name);
  private warehouseGrpcClient!: WarehouseGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    this.warehouseGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<WarehouseGrpcClient>('WarehouseApi');
  }

  async createWarehouse(accessToken: string, body: CreateWarehouseDto) {
    const user = await this.authenticateForWrite(accessToken);

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

  async listWarehouses(accessToken: string) {
    await this.authenticate(accessToken);

    const response = await this.handleListWarehousesGrpcRequest(
      firstValueFrom(this.warehouseGrpcClient.listWarehouses({})),
    );

    return {
      warehouses: (response.warehouses ?? []).map((warehouse) =>
        this.toWarehouseResponse(warehouse),
      ),
    };
  }

  async getWarehouse(accessToken: string, warehouseId: string) {
    await this.authenticate(accessToken);

    return this.handleWarehouseGrpcRequest(
      firstValueFrom(this.warehouseGrpcClient.getWarehouse({ warehouseId })),
    );
  }

  async updateWarehouse(
    accessToken: string,
    warehouseId: string,
    body: UpdateWarehouseDto,
  ) {
    const user = await this.authenticateForWrite(accessToken);

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

  async deleteWarehouse(accessToken: string, warehouseId: string) {
    const user = await this.authenticateForWrite(accessToken);

    return this.handleWarehouseGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.deleteWarehouse({
          warehouseId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async createWarehouseLocation(
    accessToken: string,
    body: CreateWarehouseLocationDto,
  ) {
    const user = await this.authenticateForWrite(accessToken);

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

  async listWarehouseLocations(accessToken: string, warehouseId?: string) {
    await this.authenticate(accessToken);

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

  async getWarehouseLocation(accessToken: string, locationId: string) {
    await this.authenticate(accessToken);

    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.getWarehouseLocation({ locationId }),
      ),
    );
  }

  async updateWarehouseLocation(
    accessToken: string,
    locationId: string,
    body: UpdateWarehouseLocationDto,
  ) {
    const user = await this.authenticateForWrite(accessToken);

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

  async deleteWarehouseLocation(accessToken: string, locationId: string) {
    const user = await this.authenticateForWrite(accessToken);

    return this.handleWarehouseLocationGrpcRequest(
      firstValueFrom(
        this.warehouseGrpcClient.deleteWarehouseLocation({
          locationId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  private async authenticate(accessToken: string): Promise<AuthenticatedUser> {
    return this.authService.validateAccessToken(accessToken);
  }

  private async authenticateForWrite(accessToken: string) {
    const user = await this.authenticate(accessToken);
    this.assertRole(user, WRITE_ALLOWED_ROLES);

    return user;
  }

  private assertRole(user: AuthenticatedUser, allowedRoles: string[]) {
    const roles = user.roles.map((role) => role.toUpperCase());

    if (!roles.some((role) => allowedRoles.includes(role))) {
      throw new ForbiddenException('You do not have permission');
    }
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
      warehouse_id: warehouse.warehouseId ?? warehouse.warehouse_id ?? '',
      warehouse_code:
        warehouse.warehouseCode ?? warehouse.warehouse_code ?? '',
      warehouse_name:
        warehouse.warehouseName ?? warehouse.warehouse_name ?? '',
      address: warehouse.address,
      status: warehouse.status,
      created_by: warehouse.createdBy ?? warehouse.created_by ?? '',
      updated_by: warehouse.updatedBy ?? warehouse.updated_by ?? '',
      created_at: warehouse.createdAt ?? warehouse.created_at ?? '',
      updated_at: warehouse.updatedAt ?? warehouse.updated_at ?? '',
    };
  }

  private toWarehouseLocationResponse(location?: WarehouseLocationGrpc) {
    if (!location) {
      return null;
    }

    return {
      location_id: location.locationId ?? location.location_id ?? '',
      warehouse_id: location.warehouseId ?? location.warehouse_id ?? '',
      zone: location.zone,
      status: location.status,
      created_by: location.createdBy ?? location.created_by ?? '',
      updated_by: location.updatedBy ?? location.updated_by ?? '',
      created_at: location.createdAt ?? location.created_at ?? '',
      updated_at: location.updatedAt ?? location.updated_at ?? '',
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

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
