import {
  BadRequestException,
  Controller,
  Get,
  Headers,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ActivityLogService } from './activity-log.service';

@Controller('api/activity-logs')
export class ActivityLogController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @Get()
  listActivityLogs(
    @Headers('authorization') authorization: string | undefined,
    @Query('page') page?: string,
  ) {
    return this.activityLogService.listActivityLogs(
      this.extractBearerToken(authorization),
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
