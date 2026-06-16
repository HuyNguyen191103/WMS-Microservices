import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import type { ClientGrpc } from '@nestjs/microservices';
import { status } from '@grpc/grpc-js';
import { firstValueFrom } from 'rxjs';
import {
  ActivityLogGrpc,
  ActivityLogGrpcClient,
} from '../grpc/activity-log-grpc.types';
import { WMS_GRPC_CLIENT } from '../wms.constants';

@Injectable()
export class ActivityLogService implements OnModuleInit {
  private readonly logger = new Logger(ActivityLogService.name);
  private activityLogGrpcClient!: ActivityLogGrpcClient;

  constructor(
    @Inject(WMS_GRPC_CLIENT) private readonly client: Record<string, unknown>,
  ) {}

  onModuleInit() {
    this.activityLogGrpcClient = (
      this.client as unknown as ClientGrpc
    ).getService<ActivityLogGrpcClient>('ActivityLogApi');
  }

  async listActivityLogs(page: number) {
    try {
      const response = await firstValueFrom(
        this.activityLogGrpcClient.listActivityLogs({ page }),
      );
      const activityLogs =
        response.activityLogs ?? response.activity_logs ?? [];

      return {
        activity_logs: activityLogs.map((activityLog) =>
          this.toActivityLogResponse(activityLog),
        ),
        pagination: {
          page: response.page ?? page,
          page_size: response.pageSize ?? response.page_size ?? 20,
          total_items: response.totalItems ?? response.total_items ?? 0,
          total_pages: response.totalPages ?? response.total_pages ?? 0,
        },
      };
    } catch (error) {
      throw this.toHttpException(error);
    }
  }

  private toActivityLogResponse(activityLog: ActivityLogGrpc) {
    return {
      log_id: activityLog.logId ?? activityLog.log_id ?? '',
      user_id: activityLog.userId ?? activityLog.user_id ?? '',
      username: activityLog.username,
      action: activityLog.action,
      reference_type:
        activityLog.referenceType ?? activityLog.reference_type ?? '',
      reference_id: activityLog.referenceId ?? activityLog.reference_id ?? '',
      description: activityLog.description,
      created_at: activityLog.createdAt ?? activityLog.created_at ?? '',
    };
  }

  private toHttpException(error: unknown) {
    const grpcError = error as { code?: number; details?: string };
    this.logger.warn(
      `WMS ActivityLog gRPC request failed: code=${grpcError.code ?? 'unknown'}, details=${grpcError.details ?? 'none'}`,
    );

    const message = grpcError.details || 'WMS activity log request failed';

    if (grpcError.code === status.INVALID_ARGUMENT) {
      return new BadRequestException(message);
    }

    if (grpcError.code === status.UNAUTHENTICATED) {
      return new UnauthorizedException(message);
    }

    if (grpcError.code === status.PERMISSION_DENIED) {
      return new ForbiddenException(message);
    }

    return new BadGatewayException(message);
  }
}
