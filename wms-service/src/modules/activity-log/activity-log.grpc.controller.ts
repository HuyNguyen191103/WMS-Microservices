import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type { ListActivityLogsGrpcRequest } from './grpc/activity-log-grpc.types';
import { ActivityLogService } from './activity-log.service';

@Controller()
export class ActivityLogGrpcController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  @GrpcMethod('ActivityLogApi', 'ListActivityLogs')
  listActivityLogs(request: ListActivityLogsGrpcRequest) {
    return this.activityLogService.listActivityLogs(request.page ?? 1);
  }
}
