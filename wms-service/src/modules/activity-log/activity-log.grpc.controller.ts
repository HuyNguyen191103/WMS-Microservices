import { Controller } from '@nestjs/common';
import {
  ActivityLogApiController,
  ActivityLogApiControllerMethods,
  ListActivityLogsRequest as ListActivityLogsGrpcRequest,
} from '../../generated/wms';
import { ActivityLogService } from './activity-log.service';

@Controller()
@ActivityLogApiControllerMethods()
export class ActivityLogGrpcController implements ActivityLogApiController {
  constructor(private readonly activityLogService: ActivityLogService) {}

  listActivityLogs(request: ListActivityLogsGrpcRequest) {
    return this.activityLogService.listActivityLogs(request.page ?? 1);
  }
}
