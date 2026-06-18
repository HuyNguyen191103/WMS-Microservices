import { status } from '@grpc/grpc-js';
import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Not, Repository } from 'typeorm';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { InventoryService } from '../inventory/inventory.service';
import { Product } from '../product/entities/product.entity';
import { WarehouseLocation } from '../warehouse/entities/warehouse-location.entity';
import { Warehouse } from '../warehouse/entities/warehouse.entity';
import { InboundItem } from './entities/inbound-item.entity';
import { InboundOrder } from './entities/inbound-order.entity';
import {
  ActorGrpcRequest,
  CompleteInboundGrpcRequest,
  CreateInboundGrpcRequest,
  DeleteInboundGrpcRequest,
  GetInboundGrpcRequest,
  InboundGrpc,
  InboundItemGrpc,
  InboundItemInputGrpc,
  UpdateInboundGrpcRequest,
} from './grpc/inbound-grpc.types';

const CREATED_STATUS = 'CREATED';
const DONE_STATUS = 'DONE';
const DELETE_STATUS = 'DELETE';
const ACTIVE_STATUS = 'ACTIVE';
const INBOUND_TRANSACTION_TYPE = 'INBOUND';

@Injectable()
export class InboundService {
  constructor(
    @InjectRepository(InboundOrder)
    private readonly inboundOrderRepository: Repository<InboundOrder>,
    private readonly inventoryService: InventoryService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createInbound(request: CreateInboundGrpcRequest) {
    const inbound = await this.inboundOrderRepository.manager.transaction(
      async (manager) => {
        const now = new Date();
        const inboundNo = request.inboundNo;
        const warehouseId = this.getWarehouseId(request);
        const itemInputs = this.getRequiredItems(request.items);

        await this.ensureInboundNoIsAvailable(manager, inboundNo);
        await this.ensureWarehouseIsActive(manager, warehouseId);
        await this.ensureItemsAreValid(manager, warehouseId, itemInputs);

        const inboundOrder = manager.create(InboundOrder, {
          inboundNo,
          warehouseId,
          supplierName: this.getSupplierName(request),
          actualDate: this.parseOptionalDate(request.actualDate),
          status: CREATED_STATUS,
          createdBy: request.actorUsername,
          createdAt: now,
          updatedAt: now,
        });
        const savedOrder = await manager.save(inboundOrder);

        const inboundItems = itemInputs.map((item) =>
          manager.create(InboundItem, {
            inboundOrderId: savedOrder.inboundOrderId,
            productId: this.getProductId(item),
            locationId: this.getLocationId(item),
            actualQty: item.actualQty,
          }),
        );
        await manager.save(InboundItem, inboundItems);

        await this.activityLogService.createActivityLog(
          {
            userId: request.actorUserId ?? '',
            username: request.actorUsername,
            action: 'INBOUND_CREATE',
            referenceType: 'INBOUND',
            referenceId: savedOrder.inboundOrderId,
            description: `Created inbound ${savedOrder.inboundNo}`,
          },
          manager,
        );

        return this.findInboundById(manager, savedOrder.inboundOrderId);
      },
    );

    return { inbound: this.toGrpcInbound(inbound) };
  }

  async listInbounds() {
    const inbounds = await this.inboundOrderRepository.find({
      relations: { items: true },
      order: { createdAt: 'DESC' },
    });

    return {
      inbounds: inbounds.map((inbound) => this.toGrpcInbound(inbound)),
    };
  }

  async getInbound(request: GetInboundGrpcRequest) {
    const inbound = await this.findInboundById(
      this.inboundOrderRepository.manager,
      this.getInboundOrderId(request),
    );

    return { inbound: this.toGrpcInbound(inbound) };
  }

  async updateInbound(request: UpdateInboundGrpcRequest) {
    const inbound = await this.inboundOrderRepository.manager.transaction(
      async (manager) => {
        const inboundOrderId = this.getInboundOrderId(request);
        const inbound = await this.findInboundById(manager, inboundOrderId);

        if (inbound.status !== CREATED_STATUS) {
          throw new RpcException({
            code: status.FAILED_PRECONDITION,
            message: 'Only CREATED inbound orders can be updated',
          });
        }

        const inboundNo = request.inboundNo;
        if (inboundNo && inboundNo !== inbound.inboundNo) {
          await this.ensureInboundNoIsAvailable(
            manager,
            inboundNo,
            inbound.inboundOrderId,
          );
          inbound.inboundNo = inboundNo;
        }

        const warehouseId = request.warehouseId;
        if (warehouseId && warehouseId !== inbound.warehouseId) {
          await this.ensureWarehouseIsActive(manager, warehouseId);
          inbound.warehouseId = warehouseId;
        }

        if (request.supplierName !== undefined) {
          inbound.supplierName = this.getSupplierName(request);
        }

        const actualDate = request.actualDate;
        if (actualDate !== undefined) {
          inbound.actualDate = this.parseRequiredDate(actualDate, 'actualDate');
        }

        if (request.items !== undefined) {
          const itemInputs = this.getRequiredItems(request.items);
          await this.ensureItemsAreValid(
            manager,
            inbound.warehouseId,
            itemInputs,
          );
          await manager.delete(InboundItem, { inboundOrderId });
          const inboundItems = itemInputs.map((item) =>
            manager.create(InboundItem, {
              inboundOrderId,
              productId: this.getProductId(item),
              locationId: this.getLocationId(item),
              actualQty: item.actualQty,
            }),
          );
          await manager.save(InboundItem, inboundItems);
        }

        inbound.updatedAt = new Date();
        await manager.save(inbound);
        await this.activityLogService.createActivityLog(
          {
            userId: request.actorUserId ?? '',
            username: request.actorUsername,
            action: 'INBOUND_UPDATE',
            referenceType: 'INBOUND',
            referenceId: inbound.inboundOrderId,
            description: `Updated inbound ${inbound.inboundNo}`,
          },
          manager,
        );

        return this.findInboundById(manager, inboundOrderId);
      },
    );

    return { inbound: this.toGrpcInbound(inbound) };
  }

  async completeInbound(request: CompleteInboundGrpcRequest) {
    const inbound = await this.inboundOrderRepository.manager.transaction(
      async (manager) => {
        const inboundOrderId = this.getInboundOrderId(request);
        const inbound = await this.findInboundById(manager, inboundOrderId);

        await this.markInboundDone(manager, inbound, request);

        return this.findInboundById(manager, inboundOrderId);
      },
    );

    return { inbound: this.toGrpcInbound(inbound) };
  }

  async deleteInbound(request: DeleteInboundGrpcRequest) {
    const inbound = await this.inboundOrderRepository.manager.transaction(
      async (manager) => {
        const inboundOrderId = this.getInboundOrderId(request);
        const inbound = await this.findInboundById(manager, inboundOrderId);

        if (inbound.status !== CREATED_STATUS) {
          throw new RpcException({
            code: status.FAILED_PRECONDITION,
            message: 'Only CREATED inbound orders can be deleted',
          });
        }

        inbound.status = DELETE_STATUS;
        inbound.updatedAt = new Date();
        await manager.save(inbound);
        await this.activityLogService.createActivityLog(
          {
            userId: request.actorUserId ?? '',
            username: request.actorUsername,
            action: 'INBOUND_DELETE',
            referenceType: 'INBOUND',
            referenceId: inbound.inboundOrderId,
            description: `Deleted inbound ${inbound.inboundNo}`,
          },
          manager,
        );

        return this.findInboundById(manager, inboundOrderId);
      },
    );

    return { inbound: this.toGrpcInbound(inbound) };
  }

  private async markInboundDone(
    manager: EntityManager,
    inbound: InboundOrder,
    request: ActorGrpcRequest,
  ) {
    if (inbound.status !== CREATED_STATUS) {
      throw new RpcException({
        code: status.FAILED_PRECONDITION,
        message: 'Only CREATED inbound orders can be completed',
      });
    }

    const items = await manager.find(InboundItem, {
      where: { inboundOrderId: inbound.inboundOrderId },
    });

    await this.inventoryService.recordInventoryMovements(manager, {
      transactionType: INBOUND_TRANSACTION_TYPE,
      referenceNo: inbound.inboundNo,
      createdBy: request.actorUsername,
      movements: items.map((item) => ({
        warehouseId: inbound.warehouseId,
        locationId: item.locationId,
        productId: item.productId,
        quantityChange: item.actualQty,
        transactionQuantity: item.actualQty,
      })),
    });

    inbound.status = DONE_STATUS;
    inbound.updatedAt = new Date();
    await manager.save(inbound);
    await this.activityLogService.createActivityLog(
      {
        userId: request.actorUserId ?? '',
        username: request.actorUsername,
        action: 'INBOUND_DONE',
        referenceType: 'INBOUND',
        referenceId: inbound.inboundOrderId,
        description: `Completed inbound ${inbound.inboundNo}`,
      },
      manager,
    );
  }

  private async ensureInboundNoIsAvailable(
    manager: EntityManager,
    inboundNo: string,
    currentInboundOrderId?: string,
  ) {
    const existingInbound = await manager.findOne(InboundOrder, {
      where: {
        inboundNo,
        ...(currentInboundOrderId
          ? { inboundOrderId: Not(currentInboundOrderId) }
          : {}),
      },
    });

    if (existingInbound) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Inbound number already exists',
      });
    }
  }

  private async ensureWarehouseIsActive(
    manager: EntityManager,
    warehouseId: string,
  ) {
    const warehouse = await manager.findOne(Warehouse, {
      where: { warehouseId },
    });

    if (!warehouse) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Warehouse not found',
      });
    }

    if (warehouse.status !== ACTIVE_STATUS) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse is not active',
      });
    }
  }

  private async ensureItemsAreValid(
    manager: EntityManager,
    warehouseId: string,
    items: InboundItemInputGrpc[],
  ) {
    await this.ensureWarehouseIsActive(manager, warehouseId);

    for (const item of items) {
      const productId = this.getProductId(item);
      const locationId = this.getLocationId(item);

      const product = await manager.findOne(Product, {
        where: { productId },
      });
      if (!product) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Product not found',
        });
      }
      if (product.status !== ACTIVE_STATUS) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Product is not active',
        });
      }

      const location = await manager.findOne(WarehouseLocation, {
        where: { locationId },
      });
      if (!location) {
        throw new RpcException({
          code: status.NOT_FOUND,
          message: 'Warehouse location not found',
        });
      }
      if (location.status !== ACTIVE_STATUS) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Warehouse location is not active',
        });
      }
      if (location.warehouseId !== warehouseId) {
        throw new RpcException({
          code: status.INVALID_ARGUMENT,
          message: 'Warehouse location does not belong to warehouse',
        });
      }
    }
  }

  private async findInboundById(
    manager: EntityManager,
    inboundOrderId: string,
  ) {
    const inbound = await manager.findOne(InboundOrder, {
      where: { inboundOrderId },
      relations: { items: true },
    });

    if (!inbound) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Inbound order not found',
      });
    }

    return inbound;
  }

  private getRequiredItems(items?: InboundItemInputGrpc[]) {
    if (!items || items.length === 0) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Inbound items are required',
      });
    }

    return items;
  }

  private getInboundOrderId(
    request:
      | GetInboundGrpcRequest
      | UpdateInboundGrpcRequest
      | CompleteInboundGrpcRequest
      | DeleteInboundGrpcRequest,
  ) {
    const inboundOrderId = request.inboundOrderId;

    if (!inboundOrderId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Inbound order id is required',
      });
    }

    return inboundOrderId;
  }

  private getWarehouseId(request: CreateInboundGrpcRequest) {
    const warehouseId = request.warehouseId;

    if (!warehouseId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Warehouse id is required',
      });
    }

    return warehouseId;
  }

  private getProductId(item: InboundItemInputGrpc) {
    const productId = item.productId;

    if (!productId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Product id is required',
      });
    }

    return productId;
  }

  private getLocationId(item: InboundItemInputGrpc) {
    const locationId = item.locationId;

    if (!locationId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Location id is required',
      });
    }

    return locationId;
  }

  private getSupplierName(
    request: CreateInboundGrpcRequest | UpdateInboundGrpcRequest,
  ) {
    return request.supplierName ?? '';
  }

  private parseOptionalDate(value?: string) {
    if (!value) {
      return undefined;
    }

    return this.parseRequiredDate(value, 'actualDate');
  }

  private parseRequiredDate(value: string, fieldName: string) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: `${fieldName} must be a valid date`,
      });
    }

    return date;
  }

  private toGrpcInbound(inbound: InboundOrder): InboundGrpc {
    return {
      inboundOrderId: inbound.inboundOrderId,
      inboundNo: inbound.inboundNo,
      warehouseId: inbound.warehouseId,
      supplierName: inbound.supplierName ?? '',
      actualDate: inbound.actualDate?.toISOString() ?? '',
      status: inbound.status,
      createdBy: inbound.createdBy ?? '',
      createdAt: inbound.createdAt?.toISOString() ?? '',
      updatedAt: inbound.updatedAt?.toISOString() ?? '',
      items: (inbound.items ?? []).map((item) => this.toGrpcInboundItem(item)),
    };
  }

  private toGrpcInboundItem(item: InboundItem): InboundItemGrpc {
    return {
      inboundItemId: item.inboundItemId,
      inboundOrderId: item.inboundOrderId,
      productId: item.productId,
      locationId: item.locationId,
      actualQty: item.actualQty,
    };
  }
}
