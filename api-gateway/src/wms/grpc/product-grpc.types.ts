import { Observable } from 'rxjs';

export interface ProductGrpcClient {
  createProduct(
    request: CreateProductGrpcRequest,
  ): Observable<ProductGrpcResponse>;
  listProducts(
    request: ListProductsGrpcRequest,
  ): Observable<ListProductsGrpcResponse>;
  getProduct(request: GetProductGrpcRequest): Observable<ProductGrpcResponse>;
  updateProduct(
    request: UpdateProductGrpcRequest,
  ): Observable<ProductGrpcResponse>;
  deleteProduct(
    request: DeleteProductGrpcRequest,
  ): Observable<ProductGrpcResponse>;
}

export interface CreateProductGrpcRequest {
  sku: string;
  productName: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername: string;
  actorUserId: string;
  actorRole: string;
}

export interface ListProductsGrpcRequest {}

export interface GetProductGrpcRequest {
  productId: string;
}

export interface UpdateProductGrpcRequest {
  productId: string;
  sku?: string;
  productName?: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername: string;
  actorUserId: string;
  actorRole: string;
}

export interface DeleteProductGrpcRequest {
  productId: string;
  actorUsername: string;
  actorUserId: string;
  actorRole: string;
}

export interface ProductGrpc {
  productId?: string;
  product_id?: string;
  sku: string;
  productName?: string;
  product_name?: string;
  description: string;
  category: string;
  unit: string;
  status: string;
  createdBy?: string;
  created_by?: string;
  updatedBy?: string;
  updated_by?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
}

export interface ProductGrpcResponse {
  product?: ProductGrpc;
}

export interface ListProductsGrpcResponse {
  products?: ProductGrpc[];
}
