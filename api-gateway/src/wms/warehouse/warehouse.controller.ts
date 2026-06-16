import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { AuthenticatedUser } from '../../auth/authenticated-user.interface';
import { CurrentUser } from '../../auth/current-user.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { CreateWarehouseLocationDto } from './dto/create-warehouse-location.dto';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseLocationDto } from './dto/update-warehouse-location.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { WarehouseService } from './warehouse.service';

const WRITE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post('api/warehouses')
  @Roles(...WRITE_ALLOWED_ROLES)
  createWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateWarehouseDto,
  ) {
    return this.warehouseService.createWarehouse(user, body);
  }

  @Get('api/warehouses')
  listWarehouses() {
    return this.warehouseService.listWarehouses();
  }

  @Get('api/warehouses/:warehouseId')
  getWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.warehouseService.getWarehouse(warehouseId);
  }

  @Patch('api/warehouses/:warehouseId')
  @Roles(...WRITE_ALLOWED_ROLES)
  updateWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('warehouseId') warehouseId: string,
    @Body() body: UpdateWarehouseDto,
  ) {
    return this.warehouseService.updateWarehouse(user, warehouseId, body);
  }

  @Delete('api/warehouses/:warehouseId')
  @Roles(...WRITE_ALLOWED_ROLES)
  deleteWarehouse(
    @CurrentUser() user: AuthenticatedUser,
    @Param('warehouseId') warehouseId: string,
  ) {
    return this.warehouseService.deleteWarehouse(user, warehouseId);
  }

  @Post('api/warehouse-locations')
  @Roles(...WRITE_ALLOWED_ROLES)
  createWarehouseLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateWarehouseLocationDto,
  ) {
    return this.warehouseService.createWarehouseLocation(user, body);
  }

  @Get('api/warehouse-locations')
  listWarehouseLocations(@Query('warehouseId') warehouseId?: string) {
    return this.warehouseService.listWarehouseLocations(warehouseId);
  }

  @Get('api/warehouse-locations/:locationId')
  getWarehouseLocation(@Param('locationId') locationId: string) {
    return this.warehouseService.getWarehouseLocation(locationId);
  }

  @Patch('api/warehouse-locations/:locationId')
  @Roles(...WRITE_ALLOWED_ROLES)
  updateWarehouseLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('locationId') locationId: string,
    @Body() body: UpdateWarehouseLocationDto,
  ) {
    return this.warehouseService.updateWarehouseLocation(
      user,
      locationId,
      body,
    );
  }

  @Delete('api/warehouse-locations/:locationId')
  @Roles(...WRITE_ALLOWED_ROLES)
  deleteWarehouseLocation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('locationId') locationId: string,
  ) {
    return this.warehouseService.deleteWarehouseLocation(user, locationId);
  }
}
