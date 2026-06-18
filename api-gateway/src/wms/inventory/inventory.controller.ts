import {
  BadRequestException,
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { Roles } from '../../auth/roles.decorator';
import { RolesGuard } from '../../auth/roles.guard';
import { InventoryService } from './inventory.service';

const TRANSACTION_READ_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

@Controller('api')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('inventory-items')
  listInventoryItems(@Query('warehouseId') warehouseId?: string) {
    if (!warehouseId?.trim()) {
      throw new BadRequestException('Warehouse id is required');
    }

    return this.inventoryService.listInventoryItems(warehouseId.trim());
  }

  @Get('inventory-transactions')
  @UseGuards(RolesGuard)
  @Roles(...TRANSACTION_READ_ROLES)
  listInventoryTransactions(@Query('page') page?: string) {
    return this.inventoryService.listInventoryTransactions(
      this.parsePage(page),
    );
  }

  private parsePage(page?: string): number {
    if (!page) {
      return 1;
    }

    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      throw new BadRequestException('Invalid page');
    }

    return parsedPage;
  }
}
