import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  CreateProductGrpcRequest,
  DeleteProductGrpcRequest,
  GetProductGrpcRequest,
  ListProductsGrpcRequest,
  UpdateProductGrpcRequest,
} from './grpc/product-grpc.types';
import { ProductService } from './product.service';

@Controller()
export class ProductGrpcController {
  constructor(private readonly productService: ProductService) {}

  @GrpcMethod('ProductApi', 'CreateProduct')
  createProduct(request: CreateProductGrpcRequest) {
    return this.productService.createProduct(request);
  }

  @GrpcMethod('ProductApi', 'ListProducts')
  listProducts(_request: ListProductsGrpcRequest) {
    return this.productService.listProducts();
  }

  @GrpcMethod('ProductApi', 'GetProduct')
  getProduct(request: GetProductGrpcRequest) {
    return this.productService.getProduct(request);
  }

  @GrpcMethod('ProductApi', 'UpdateProduct')
  updateProduct(request: UpdateProductGrpcRequest) {
    return this.productService.updateProduct(request);
  }

  @GrpcMethod('ProductApi', 'DeleteProduct')
  deleteProduct(request: DeleteProductGrpcRequest) {
    return this.productService.deleteProduct(request);
  }
}
