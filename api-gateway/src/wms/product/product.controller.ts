import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

@Controller('api/products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  createProduct(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateProductDto,
  ) {
    return this.productService.createProduct(
      this.extractBearerToken(authorization),
      body,
    );
  }

  @Get()
  listProducts(@Headers('authorization') authorization: string | undefined) {
    return this.productService.listProducts(
      this.extractBearerToken(authorization),
    );
  }

  @Get(':productId')
  getProduct(
    @Headers('authorization') authorization: string | undefined,
    @Param('productId') productId: string,
  ) {
    return this.productService.getProduct(
      this.extractBearerToken(authorization),
      productId,
    );
  }

  @Patch(':productId')
  updateProduct(
    @Headers('authorization') authorization: string | undefined,
    @Param('productId') productId: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.updateProduct(
      this.extractBearerToken(authorization),
      productId,
      body,
    );
  }

  @Delete(':productId')
  deleteProduct(
    @Headers('authorization') authorization: string | undefined,
    @Param('productId') productId: string,
  ) {
    return this.productService.deleteProduct(
      this.extractBearerToken(authorization),
      productId,
    );
  }

  private extractBearerToken(authorization?: string): string {
    if (!authorization) {
      throw new UnauthorizedException('Missing Authorization header');
    }

    const [scheme, token] = authorization.split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid Authorization header');
    }

    return token;
  }
}
