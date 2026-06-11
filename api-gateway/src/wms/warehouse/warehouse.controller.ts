import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

@Controller()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('api/warehouses')
  createWarehouse(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateWarehouseDto,
  ) {
    return this.warehouseService.createWarehouse(
      this.extractBearerToken(authorization),
      body,
    );
  }

  @Get('api/warehouses')
  listWarehouses(@Headers('authorization') authorization: string | undefined) {
    return this.warehouseService.listWarehouses(
      this.extractBearerToken(authorization),
    );
  }

  @Get('api/warehouses/:warehouseId')
  getWarehouse(
    @Headers('authorization') authorization: string | undefined,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.warehouseService.getWarehouse(
      this.extractBearerToken(authorization),
      warehouseId,
    );
  }

  @Patch('api/warehouses/:warehouseId')
  updateWarehouse(
    @Headers('authorization') authorization: string | undefined,
    @Param('warehouseId') warehouseId: string,
    @Body() body: UpdateWarehouseDto,
  ) {
    return this.warehouseService.updateWarehouse(
      this.extractBearerToken(authorization),
      warehouseId,
      body,
    );
  }

  @Delete('api/warehouses/:warehouseId')
  deleteWarehouse(
    @Headers('authorization') authorization: string | undefined,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.warehouseService.deleteWarehouse(
      this.extractBearerToken(authorization),
      warehouseId,
    );
  }

  @Post('api/warehouse-locations')
  createWarehouseLocation(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: CreateWarehouseLocationDto,
  ) {
    return this.warehouseService.createWarehouseLocation(
      this.extractBearerToken(authorization),
      body,
    );
  }

  @Get('api/warehouse-locations')
  listWarehouseLocations(
    @Headers('authorization') authorization: string | undefined,
    @Query('warehouseId') warehouseId?: string,
  ) {
    return this.warehouseService.listWarehouseLocations(
      this.extractBearerToken(authorization),
      warehouseId,
    );
  }

  @Get('api/warehouse-locations/:locationId')
  getWarehouseLocation(
    @Headers('authorization') authorization: string | undefined,
    @Param('locationId') locationId: string,
  ) {
    return this.warehouseService.getWarehouseLocation(
      this.extractBearerToken(authorization),
      locationId,
    );
  }

  @Patch('api/warehouse-locations/:locationId')
  updateWarehouseLocation(
    @Headers('authorization') authorization: string | undefined,
    @Param('locationId') locationId: string,
    @Body() body: UpdateWarehouseLocationDto,
  ) {
    return this.warehouseService.updateWarehouseLocation(
      this.extractBearerToken(authorization),
      locationId,
      body,
    );
  }

  @Delete('api/warehouse-locations/:locationId')
  deleteWarehouseLocation(
    @Headers('authorization') authorization: string | undefined,
    @Param('locationId') locationId: string,
  ) {
    return this.warehouseService.deleteWarehouseLocation(
      this.extractBearerToken(authorization),
      locationId,
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
