import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../activity-log/entities/activity-log.entity';
import { Product } from './entities/product.entity';
import {
  CreateProductGrpcRequest,
  DeleteProductGrpcRequest,
  GetProductGrpcRequest,
  ProductGrpc,
  UpdateProductGrpcRequest,
} from './grpc/product-grpc.types';

const ACTIVE_STATUS = 'ACTIVE';
const DELETED_STATUS = 'DELETE';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async createProduct(request: CreateProductGrpcRequest) {
    const now = new Date();
    const actorUsername = this.getActorUsername(request);
    const existingProduct = await this.productRepository.findOne({
      where: { sku: request.sku },
    });

    if (existingProduct?.status === ACTIVE_STATUS) {
      throw new RpcException({
        code: status.ALREADY_EXISTS,
        message: 'Product SKU already exists',
      });
    }

    const product = existingProduct ?? this.productRepository.create();
    product.sku = request.sku;
    product.productName = request.productName ?? request.product_name ?? '';
    product.description = request.description || null;
    product.category = request.category || null;
    product.unit = request.unit || null;
    product.status = ACTIVE_STATUS;
    product.createdBy = actorUsername;
    product.updatedBy = actorUsername;
    product.createdAt = now;
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.createActivityLog(
      request,
      'PRODUCT_CREATE',
      savedProduct.productId,
      existingProduct
        ? `Overwrote product ${savedProduct.sku}`
        : `Created product ${savedProduct.sku}`,
    );

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
    product.productName =
      request.productName ?? request.product_name ?? product.productName;
    product.description =
      request.description === undefined ? product.description : request.description || null;
    product.category =
      request.category === undefined ? product.category : request.category || null;
    product.unit = request.unit === undefined ? product.unit : request.unit || null;
    product.updatedBy = this.getActorUsername(request);
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.createActivityLog(
      request,
      'PRODUCT_UPDATE',
      savedProduct.productId,
      `Updated product ${savedProduct.sku}`,
    );

    return { product: this.toGrpcProduct(savedProduct) };
  }

  async deleteProduct(request: DeleteProductGrpcRequest) {
    const product = await this.findActiveProduct(this.getProductId(request));
    const now = new Date();

    product.status = DELETED_STATUS;
    product.updatedBy = this.getActorUsername(request);
    product.updatedAt = now;

    const savedProduct = await this.productRepository.save(product);
    await this.createActivityLog(
      request,
      'PRODUCT_DELETE',
      savedProduct.productId,
      `Deleted product ${savedProduct.sku}`,
    );

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

  private async createActivityLog(
    request:
      | CreateProductGrpcRequest
      | UpdateProductGrpcRequest
      | DeleteProductGrpcRequest,
    action: string,
    referenceId: string,
    description: string,
  ) {
    await this.activityLogRepository.save(
      this.activityLogRepository.create({
        userId: request.actorUserId ?? request.actor_user_id ?? null,
        username: this.getActorUsername(request),
        action,
        referenceType: 'PRODUCT',
        referenceId,
        description,
        createdAt: new Date(),
      }),
    );
  }

  private getProductId(request: GetProductGrpcRequest): string {
    const productId = request.productId ?? request.product_id;

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
      | DeleteProductGrpcRequest,
  ) {
    return request.actorUsername ?? request.actor_username ?? null;
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
