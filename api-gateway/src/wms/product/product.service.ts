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
  ListProductsGrpcResponse,
  ProductGrpc,
  ProductGrpcClient,
  ProductGrpcResponse,
} from '../grpc/product-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const CREATE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE'];
const WRITE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

interface AuthenticatedUser {
  user_id: string;
  username: string;
  roles: string[];
}

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger = new Logger(ProductService.name);
  private productGrpcClient!: ProductGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
    private readonly authService: AuthService,
  ) {}

  onModuleInit() {
    this.productGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<ProductGrpcClient>('ProductApi');
  }

  async createProduct(accessToken: string, body: CreateProductDto) {
    const user = await this.authenticate(accessToken);
    this.assertRole(user, CREATE_ALLOWED_ROLES);

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

  async listProducts(accessToken: string) {
    await this.authenticate(accessToken);

    const response = await this.handleListGrpcRequest(
      firstValueFrom(this.productGrpcClient.listProducts({})),
    );

    return {
      products: (response.products ?? []).map((product) =>
        this.toProductResponse(product),
      ),
    };
  }

  async getProduct(accessToken: string, productId: string) {
    await this.authenticate(accessToken);

    return this.handleGrpcRequest(
      firstValueFrom(this.productGrpcClient.getProduct({ productId })),
    );
  }

  async updateProduct(
    accessToken: string,
    productId: string,
    body: UpdateProductDto,
  ) {
    const user = await this.authenticate(accessToken);
    this.assertRole(user, WRITE_ALLOWED_ROLES);

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

  async deleteProduct(accessToken: string, productId: string) {
    const user = await this.authenticate(accessToken);
    this.assertRole(user, WRITE_ALLOWED_ROLES);

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

  private async authenticate(accessToken: string): Promise<AuthenticatedUser> {
    return this.authService.validateAccessToken(accessToken);
  }

  private assertRole(user: AuthenticatedUser, allowedRoles: string[]) {
    const roles = user.roles.map((role) => role.toUpperCase());

    if (!roles.some((role) => allowedRoles.includes(role))) {
      throw new ForbiddenException('You do not have permission');
    }
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

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
