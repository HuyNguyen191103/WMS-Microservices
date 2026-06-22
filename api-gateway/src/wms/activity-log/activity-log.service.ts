import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  ACTIVITY_LOG_API_SERVICE_NAME,
  ActivityLog as ActivityLogGrpc,
  ActivityLogApiClient as ActivityLogGrpcClient,
} from '../../generated/wms';
import { WmsGrpcExceptionMapper } from '../grpc/wms-grpc-exception.mapper';
import { WMS_GRPC_CLIENT } from '../wms.constants';

@Injectable()
export class ActivityLogService implements OnModuleInit {
  private activityLogGrpcClient!: ActivityLogGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT)
    private readonly client: ClientGrpc,
    private readonly exceptionMapper: WmsGrpcExceptionMapper,
  ) {}

  onModuleInit() {
    this.activityLogGrpcClient = this.client.getService<ActivityLogGrpcClient>(
      ACTIVITY_LOG_API_SERVICE_NAME,
    );
  }

  async listActivityLogs(page: number) {
    try {
      const response = await firstValueFrom(
        this.activityLogGrpcClient.listActivityLogs({ page }),
      );
      const activityLogs = response.activityLogs ?? [];

      return {
        activity_logs: activityLogs.map((activityLog) =>
          this.toActivityLogResponse(activityLog),
        ),
        pagination: {
          page: response.page ?? page,
          page_size: response.pageSize ?? 20,
          total_items: response.totalItems ?? 0,
          total_pages: response.totalPages ?? 0,
        },
      };
    } catch (error) {
      throw this.mapGrpcError(error);
    }
  }

  private toActivityLogResponse(activityLog: ActivityLogGrpc) {
    return {
      log_id: activityLog.logId ?? '',
      user_id: activityLog.userId ?? '',
      username: activityLog.username,
      action: activityLog.action,
      reference_type: activityLog.referenceType ?? '',
      reference_id: activityLog.referenceId ?? '',
      description: activityLog.description,
      created_at: activityLog.createdAt ?? '',
    };
  }

  private mapGrpcError(error: unknown) {
    return this.exceptionMapper.toHttpException(error, {
      domain: 'ActivityLog',
      fallbackMessage: 'WMS activity log request failed',
    });
  }
}
