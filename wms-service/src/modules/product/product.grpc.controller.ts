import { Controller } from '@nestjs/common';
import {
  CreateProductRequest as CreateProductGrpcRequest,
  DeleteProductRequest as DeleteProductGrpcRequest,
  GetProductRequest as GetProductGrpcRequest,
  ListProductsRequest as ListProductsGrpcRequest,
  ProductApiController,
  ProductApiControllerMethods,
  RestoreProductRequest as RestoreProductGrpcRequest,
  UpdateProductRequest as UpdateProductGrpcRequest,
} from '../../generated/wms';
import { ProductService } from './product.service';

@Controller()
@ProductApiControllerMethods()
export class ProductGrpcController implements ProductApiController {
  constructor(private readonly productService: ProductService) {}

  createProduct(request: CreateProductGrpcRequest) {
    return this.productService.createProduct(request);
  }

  listProducts(_request: ListProductsGrpcRequest) {
    void _request;
    return this.productService.listProducts();
  }

  getProduct(request: GetProductGrpcRequest) {
    return this.productService.getProduct(request);
  }

  updateProduct(request: UpdateProductGrpcRequest) {
    return this.productService.updateProduct(request);
  }

  deleteProduct(request: DeleteProductGrpcRequest) {
    return this.productService.deleteProduct(request);
  }

  restoreProduct(request: RestoreProductGrpcRequest) {
    return this.productService.restoreProduct(request);
  }
}
