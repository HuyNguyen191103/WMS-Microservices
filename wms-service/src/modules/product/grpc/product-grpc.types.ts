export interface CreateProductGrpcRequest {
  sku: string;
  productName?: string;
  product_name?: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername?: string;
  actor_username?: string;
  actorUserId?: string;
  actor_user_id?: string;
  actorRole?: string;
  actor_role?: string;
}

export interface ListProductsGrpcRequest {}

export interface GetProductGrpcRequest {
  productId?: string;
  product_id?: string;
}

export interface UpdateProductGrpcRequest {
  productId?: string;
  product_id?: string;
  sku?: string;
  productName?: string;
  product_name?: string;
  description?: string;
  category?: string;
  unit?: string;
  actorUsername?: string;
  actor_username?: string;
  actorUserId?: string;
  actor_user_id?: string;
  actorRole?: string;
  actor_role?: string;
}

export interface DeleteProductGrpcRequest {
  productId?: string;
  product_id?: string;
  actorUsername?: string;
  actor_username?: string;
  actorUserId?: string;
  actor_user_id?: string;
  actorRole?: string;
  actor_role?: string;
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
  product: ProductGrpc;
}

export interface ListProductsGrpcResponse {
  products: ProductGrpc[];
}
