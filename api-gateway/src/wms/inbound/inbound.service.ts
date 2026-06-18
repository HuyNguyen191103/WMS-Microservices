import { status } from '@grpc/grpc-js';
import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
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
import { WmsGrpcExceptionMapper } from '../grpc/wms-grpc-exception.mapper';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';

@Injectable()
export class InboundService implements OnModuleInit {
  private inboundGrpcClient!: InboundGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
    private readonly exceptionMapper: WmsGrpcExceptionMapper,
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
      throw this.mapGrpcError(error);
    }
  }

  private async handleListInboundsGrpcRequest<
    T extends ListInboundsGrpcResponse,
  >(request: Promise<T>) {
    try {
      return await request;
    } catch (error) {
      throw this.mapGrpcError(error);
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

  private mapGrpcError(error: unknown) {
    return this.exceptionMapper.toHttpException(error, {
      domain: 'Inbound',
      fallbackMessage: 'WMS inbound request failed',
      additionalBadRequestCodes: [status.FAILED_PRECONDITION],
    });
  }
}
