import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/authenticated-user.interface';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductService } from './product.service';

const CREATE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE'];
const WRITE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

@Controller('api/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {
    console.log('ProductController initialized');
  }

  @Post()
  @Roles(...CREATE_ALLOWED_ROLES)
  createProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateProductDto,
  ) {
    console.log('Received create product request:', { body });
    return this.productService.createProduct(user, body);
  }

  @Get()
  listProducts() {
    return this.productService.listProducts();
  }

  @Get(':productId')
  getProduct(@Param('productId') productId: string) {
    return this.productService.getProduct(productId);
  }

  @Patch(':productId')
  @Roles(...WRITE_ALLOWED_ROLES)
  updateProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
    @Body() body: UpdateProductDto,
  ) {
    return this.productService.updateProduct(user, productId, body);
  }

  @Delete(':productId')
  @Roles(...WRITE_ALLOWED_ROLES)
  deleteProduct(
    @CurrentUser() user: AuthenticatedUser,
    @Param('productId') productId: string,
  ) {
    return this.productService.deleteProduct(user, productId);
  }
}
