import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AuthenticatedUser } from '../../auth/authenticated-user.interface';
import {
  ListProductsResponse as ListProductsGrpcResponse,
  PRODUCT_API_SERVICE_NAME,
  Product as ProductGrpc,
  ProductApiClient as ProductGrpcClient,
  ProductResponse as ProductGrpcResponse,
} from '../../generated/wms';
import { WmsGrpcExceptionMapper } from '../grpc/wms-grpc-exception.mapper';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
  private productGrpcClient!: ProductGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT)
    private readonly client: ClientGrpc,

    private readonly exceptionMapper: WmsGrpcExceptionMapper,
  ) {}

  onModuleInit() {
    this.productGrpcClient = this.client.getService<ProductGrpcClient>(
      PRODUCT_API_SERVICE_NAME,
    );
  }

  async createProduct(user: AuthenticatedUser, body: CreateProductDto) {
    return this.handleGrpcRequest(
      firstValueFrom(
        this.productGrpcClient.createProduct({
          sku: body.sku,
          productName: body.productName,
          description: body.description,
          category: body.category,
          unit: body.unit,
          actorUsername: user.username,
          actorUserId: user.user_id,
          actorRole: this.getPrimaryRole(user),
        }),
      ),
    );
  }

  async listProducts() {
    const response = await this.handleListGrpcRequest(
      firstValueFrom(this.productGrpcClient.listProducts({})),
    );

    return {
      products: (response.products ?? []).map((product) =>
        this.toProductResponse(product),
      ),
    };
  }

  async getProduct(productId: string) {
    return this.handleGrpcRequest(
      firstValueFrom(this.productGrpcClient.getProduct({ productId })),
    );
  }

  async updateProduct(
    user: AuthenticatedUser,
    productId: string,
    body: UpdateProductDto,
  ) {
    return this.handleGrpcRequest(
      firstValueFrom(
        this.productGrpcClient.updateProduct({
          productId,
          sku: body.sku,
          productName: body.productName,
          description: body.description,
          category: body.category,
          unit: body.unit,
          actorUsername: user.username,
          actorUserId: user.user_id,
          actorRole: this.getPrimaryRole(user),
        }),
      ),
    );
  }

  async deleteProduct(user: AuthenticatedUser, productId: string) {
    return this.handleGrpcRequest(
      firstValueFrom(
        this.productGrpcClient.deleteProduct({
          productId,
          actorUsername: user.username,
          actorUserId: user.user_id,
          actorRole: this.getPrimaryRole(user),
        }),
      ),
    );
  }

  async restoreProduct(user: AuthenticatedUser, productId: string) {
    return this.handleGrpcRequest(
      firstValueFrom(
        this.productGrpcClient.restoreProduct({
          productId,
          actorUsername: user.username,
          actorUserId: user.user_id,
          actorRole: this.getPrimaryRole(user),
        }),
      ),
    );
  }

  private getPrimaryRole(user: AuthenticatedUser) {
    return user.roles[0] ?? '';
  }

  private async handleGrpcRequest<T extends ProductGrpcResponse>(
    request: Promise<T>,
  ) {
    try {
      const response = await request;

      return {
        product: this.toProductResponse(response.product),
      };
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  private async handleListGrpcRequest<T extends ListProductsGrpcResponse>(
    request: Promise<T>,
  ) {
    try {
      return await request;
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  private toProductResponse(product?: ProductGrpc) {
    if (!product) {
      return null;
    }

    return {
      product_id: product.productId ?? '',
      sku: product.sku,
      product_name: product.productName ?? '',
      description: product.description,
      category: product.category,
      unit: product.unit,
      status: product.status,
      created_by: product.createdBy ?? '',
      updated_by: product.updatedBy ?? '',
      created_at: product.createdAt ?? '',
      updated_at: product.updatedAt ?? '',
    };
  }

  private mapGrpcError(error: unknown) {
    return this.exceptionMapper.toHttpException(error, {
      domain: 'Product',
      fallbackMessage: 'WMS product request failed',
    });
  }
}
