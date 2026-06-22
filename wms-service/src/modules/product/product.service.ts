import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateProductRequest as CreateProductGrpcRequest,
  DeleteProductRequest as DeleteProductGrpcRequest,
  GetProductRequest as GetProductGrpcRequest,
  Product as ProductGrpc,
  RestoreProductRequest as RestoreProductGrpcRequest,
  UpdateProductRequest as UpdateProductGrpcRequest,
} from '../../generated/wms';
import { ActivityLogService } from '../activity-log/activity-log.service';
import { Product } from './entities/product.entity';

const ACTIVE_STATUS = 'ACTIVE';
const DELETED_STATUS = 'DELETE';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  async createProduct(request: CreateProductGrpcRequest) {
    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const existingProduct = await this.productRepository.findOne({
      where: { sku: request.sku },
    });

    if (existingProduct) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message:
          existingProduct.status === DELETED_STATUS
            ? 'Product SKU belongs to a deleted product; restore it instead'
            : 'Product SKU already exists',
      });
    }

    const product = this.productRepository.create();
    product.sku = request.sku;
    product.productName = request.productName ?? '';
    product.description = request.description || '';
    product.category = request.category || '';
    product.unit = request.unit || '';
    product.status = ACTIVE_STATUS;
    product.createdBy = actorUsername;
    product.updatedBy = actorUsername;
    product.createdAt = now;
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'PRODUCT_CREATE',
      referenceType: 'PRODUCT',
      referenceId: savedProduct.productId,
      description: existingProduct
        ? `Overwrote product ${savedProduct.sku}`
        : `Created product ${savedProduct.sku}`,
    });

    return { product: this.toGrpcProduct(savedProduct) };
  }

  async listProducts() {
    const products = await this.productRepository.find({
      order: { createdAt: 'DESC' },
    });

    return { products: products.map((product) => this.toGrpcProduct(product)) };
  }

  async getProduct(request: GetProductGrpcRequest) {
    const product = await this.findProduct(this.getProductId(request));

    return { product: this.toGrpcProduct(product) };
  }

  async updateProduct(request: UpdateProductGrpcRequest) {
    const product = await this.findActiveProduct(this.getProductId(request));
    const now = new Date();

    product.sku = request.sku ?? product.sku;
    product.productName = request.productName ?? product.productName;
    product.description =
      request.description === undefined
        ? product.description
        : request.description || '';
    product.category =
      request.category === undefined
        ? product.category
        : request.category || '';
    product.unit =
      request.unit === undefined ? product.unit : request.unit || '';
    product.updatedBy = this.getActorUsername(request);
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'PRODUCT_UPDATE',
      referenceType: 'PRODUCT',
      referenceId: savedProduct.productId,
      description: `Updated product ${savedProduct.sku}`,
    });

    return { product: this.toGrpcProduct(savedProduct) };
  }

  async deleteProduct(request: DeleteProductGrpcRequest) {
    const product = await this.findActiveProduct(this.getProductId(request));
    const now = new Date();

    product.status = DELETED_STATUS;
    product.updatedBy = this.getActorUsername(request);
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'PRODUCT_DELETE',
      referenceType: 'PRODUCT',
      referenceId: savedProduct.productId,
      description: `Deleted product ${savedProduct.sku}`,
    });

    return { product: this.toGrpcProduct(savedProduct) };
  }

  async restoreProduct(request: RestoreProductGrpcRequest) {
    const product = await this.findDeletedProduct(this.getProductId(request));
    const now = new Date();

    product.status = ACTIVE_STATUS;
    product.updatedBy = this.getActorUsername(request);
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.activityLogService.createActivityLog({
      userId: request.actorUserId ?? '',
      username: this.getActorUsername(request),
      action: 'PRODUCT_RESTORE',
      referenceType: 'PRODUCT',
      referenceId: savedProduct.productId,
      description: `Restored product ${savedProduct.sku}`,
    });

    return { product: this.toGrpcProduct(savedProduct) };
  }

  private async findActiveProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: {
        productId,
        status: 'ACTIVE',
      },
    });

    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Product not found',
      });
    }

    return product;
  }

  private async findProduct(productId: string) {
    const product = await this.productRepository.findOne({
      where: { productId },
    });

    if (!product) {
      throw new RpcException({
        code: status.NOT_FOUND,
        message: 'Product not found',
      });
    }

    return product;
  }

  private async findDeletedProduct(productId: string) {
    const product = await this.findProduct(productId);

    if (product.status !== DELETED_STATUS) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Only deleted products can be restored',
      });
    }

    return product;
  }

  private getProductId(
    request:
      | GetProductGrpcRequest
      | UpdateProductGrpcRequest
      | DeleteProductGrpcRequest
      | RestoreProductGrpcRequest,
  ): string {
    const productId = request.productId;

    if (!productId) {
      throw new RpcException({
        code: status.INVALID_ARGUMENT,
        message: 'Product id is required',
      });
    }

    return productId;
  }

  private getActorUsername(
    request:
      | CreateProductGrpcRequest
      | UpdateProductGrpcRequest
      | DeleteProductGrpcRequest
      | RestoreProductGrpcRequest,
  ) {
    return request.actorUsername ?? '';
  }

  private toGrpcProduct(product: Product): ProductGrpc {
    return {
      productId: product.productId,
      sku: product.sku,
      productName: product.productName,
      description: product.description ?? '',
      category: product.category ?? '',
      unit: product.unit ?? '',
      status: product.status ?? '',
      createdBy: product.createdBy ?? '',
      updatedBy: product.updatedBy ?? '',
      createdAt: product.createdAt?.toISOString() ?? '',
      updatedAt: product.updatedAt?.toISOString() ?? '',
    };
  }
}
