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
import { CreateInboundDto } from './dto/create-inbound.dto';
import { UpdateInboundDto } from './dto/update-inbound.dto';
import { InboundService } from './inbound.service';

const READ_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER', 'EMPLOYEE'];
const WRITE_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR', 'MANAGER'];

@Controller('api/inbounds')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InboundController {
  constructor(private readonly inboundService: InboundService) {}

  @Post()
  @Roles(...READ_ALLOWED_ROLES)
  createInbound(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: CreateInboundDto,
  ) {
    return this.inboundService.createInbound(user, body);
  }

  @Get()
  @Roles(...READ_ALLOWED_ROLES)
  listInbounds() {
    return this.inboundService.listInbounds();
  }

  @Get(':inboundOrderId')
  @Roles(...READ_ALLOWED_ROLES)
  getInbound(@Param('inboundOrderId') inboundOrderId: string) {
    return this.inboundService.getInbound(inboundOrderId);
  }

  @Patch(':inboundOrderId')
  @Roles(...WRITE_ALLOWED_ROLES)
  updateInbound(
    @CurrentUser() user: AuthenticatedUser,
    @Param('inboundOrderId') inboundOrderId: string,
    @Body() body: UpdateInboundDto,
  ) {
    return this.inboundService.updateInbound(user, inboundOrderId, body);
  }

  @Patch(':inboundOrderId/done')
  @Roles(...READ_ALLOWED_ROLES)
  completeInbound(
    @CurrentUser() user: AuthenticatedUser,
    @Param('inboundOrderId') inboundOrderId: string,
  ) {
    return this.inboundService.completeInbound(user, inboundOrderId);
  }

  @Delete(':inboundOrderId')
  @Roles(...WRITE_ALLOWED_ROLES)
  deleteInbound(
    @CurrentUser() user: AuthenticatedUser,
    @Param('inboundOrderId') inboundOrderId: string,
  ) {
    return this.inboundService.deleteInbound(user, inboundOrderId);
  }
}
