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
import { ActivityLogService } from './activity-log.service';

const READ_ALLOWED_ROLES = ['ADMIN', 'DIRECTOR'];

@Controller('api/activity-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  @Roles(...READ_ALLOWED_ROLES)
  listActivityLogs(@Query('page') page?: string) {
    return this.activityLogService.listActivityLogs(this.parsePage(page));
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
