import { status } from '@grpc/grpc-js';
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
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser } from '../../auth/authenticated-user.interface';
import {
  InboundGrpc,
  InboundGrpcClient,
  InboundGrpcResponse,
  InboundItemGrpc,
  ListInboundsGrpcResponse,
} from '../grpc/inbound-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';

@Injectable()
export class InboundService implements OnModuleInit {
  private readonly logger = new Logger(InboundService.name);
  private inboundGrpcClient!: InboundGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
  ) {}

  onModuleInit() {
    this.inboundGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<InboundGrpcClient>('InboundApi');
  }

  async createInbound(user: AuthenticatedUser, body: CreateInboundDto) {
    return this.handleInboundGrpcRequest(
      firstValueFrom(
        this.inboundGrpcClient.createInbound({
          inboundNo: body.inboundNo,
          warehouseId: body.warehouseId,
          supplierName: body.supplierName,
          actualDate: body.actualDate,
          items: body.items,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async listInbounds() {
    const response = await this.handleListInboundsGrpcRequest(
      firstValueFrom(this.inboundGrpcClient.listInbounds({})),
    );

    return {
      inbounds: (response.inbounds ?? []).map((inbound) =>
        this.toInboundResponse(inbound),
      ),
    };
  }

  async getInbound(inboundOrderId: string) {
    return this.handleInboundGrpcRequest(
      firstValueFrom(this.inboundGrpcClient.getInbound({ inboundOrderId })),
    );
  }

  async updateInbound(
    user: AuthenticatedUser,
    inboundOrderId: string,
    body: UpdateInboundDto,
  ) {
    return this.handleInboundGrpcRequest(
      firstValueFrom(
        this.inboundGrpcClient.updateInbound({
          inboundOrderId,
          inboundNo: body.inboundNo,
          warehouseId: body.warehouseId,
          supplierName: body.supplierName,
          actualDate: body.actualDate,
          items: body.items,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async completeInbound(user: AuthenticatedUser, inboundOrderId: string) {
    return this.handleInboundGrpcRequest(
      firstValueFrom(
        this.inboundGrpcClient.completeInbound({
          inboundOrderId,
          ...this.toActorRequest(user),
        }),
      ),
    );
  }

  async deleteInbound(user: AuthenticatedUser, inboundOrderId: string) {
    return this.handleInboundGrpcRequest(
      firstValueFrom(
        this.inboundGrpcClient.deleteInbound({
          inboundOrderId,
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

  private async handleInboundGrpcRequest<T extends InboundGrpcResponse>(
    request: Promise<T>,
  ) {
    try {
      const response = await request;

      return {
        inbound: this.toInboundResponse(response.inbound),
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private async handleListInboundsGrpcRequest<
    T extends ListInboundsGrpcResponse,
  >(request: Promise<T>) {
    try {
      return await request;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toInboundResponse(inbound?: InboundGrpc) {
    if (!inbound) {
      return null;
    }

    return {
      inboundOrderId: inbound.inboundOrderId ?? '',
      inboundNo: inbound.inboundNo ?? '',
      warehouseId: inbound.warehouseId ?? '',
      supplierName: inbound.supplierName ?? '',
      actualDate: inbound.actualDate ?? '',
      status: inbound.status,
      createdBy: inbound.createdBy ?? '',
      createdAt: inbound.createdAt ?? '',
      updatedAt: inbound.updatedAt ?? '',
      items: (inbound.items ?? []).map((item) =>
        this.toInboundItemResponse(item),
      ),
    };
  }

  private toInboundItemResponse(item: InboundItemGrpc) {
    return {
      inboundItemId: item.inboundItemId ?? '',
      inboundOrderId: item.inboundOrderId ?? '',
      productId: item.productId ?? '',
      locationId: item.locationId ?? '',
      actualQty: item.actualQty ?? 0,
    };
  }

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `WMS Inbound gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'WMS inbound request failed';

    if (
      grpcError.code === status.INVALID_ARGUMENT ||
      grpcError.code === status.FAILED_PRECONDITION
    ) {
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
