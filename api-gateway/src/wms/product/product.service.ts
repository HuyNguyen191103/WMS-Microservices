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
  ListProductsGrpcResponse,
  ProductGrpc,
  ProductGrpcClient,
  ProductGrpcResponse,
} from '../grpc/product-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = new Logger(ProductService.name);
  private productGrpcClient!: ProductGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
  ) {}

  onModuleInit() {
    this.productGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<ProductGrpcClient>('ProductApi');
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
      throw this.toHttpException(error);
    }
  }

  private async handleListGrpcRequest<T extends ListProductsGrpcResponse>(
    request: Promise<T>,
  ) {
    try {
      return await request;
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toProductResponse(product?: ProductGrpc) {
    if (!product) {
      return null;
    }

    return {
      product_id: product.productId ?? product.product_id ?? '',
      sku: product.sku,
      product_name: product.productName ?? product.product_name ?? '',
      description: product.description,
      category: product.category,
      unit: product.unit,
      status: product.status,
      created_by: product.createdBy ?? product.created_by ?? '',
      updated_by: product.updatedBy ?? product.updated_by ?? '',
      created_at: product.createdAt ?? product.created_at ?? '',
      updated_at: product.updatedAt ?? product.updated_at ?? '',
    };
  }

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `WMS Product gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'WMS product request failed';

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
