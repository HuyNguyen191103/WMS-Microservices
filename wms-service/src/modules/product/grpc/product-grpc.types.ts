export interface CreateProductGrpcRequest {
  sku: string;
  productName?: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername?: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface ListProductsGrpcRequest {}

export interface GetProductGrpcRequest {
  productId?: string;
}

export interface UpdateProductGrpcRequest {
  productId?: string;
  sku?: string;
  productName?: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername?: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface DeleteProductGrpcRequest {
  productId?: string;
  actorUsername?: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface RestoreProductGrpcRequest {
  productId?: string;
  actorUsername?: string;
  actorUserId?: string;
  actorRole?: string;
}

export interface ProductGrpc {
  productId?: string;
  sku: string;
  productName?: string;
  description: string;
  category: string;
  unit: string;
  status: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductGrpcResponse {
  product: ProductGrpc;
}

export interface ListProductsGrpcResponse {
  products: ProductGrpc[];
}
