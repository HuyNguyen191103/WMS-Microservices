import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogGrpc } from './grpc/activity-log-grpc.types';

const PAGE_SIZE = 20;

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async listActivityLogs(page = 1) {
    const currentPage = page > 0 ? page : 1;
    const [activityLogs, totalItems] =
      await this.activityLogRepository.findAndCount({
        order: { createdAt: 'DESC' },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      });

    return {
      activityLogs: activityLogs.map((activityLog) =>
        this.toGrpcActivityLog(activityLog),
      ),
      page: currentPage,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages: Math.ceil(totalItems / PAGE_SIZE),
    };
  }

  async listAllActivityLogs() {
    const activityLogs = await this.activityLogRepository.find({
      order: { createdAt: 'DESC' },
    });

    return {
      activityLogs: activityLogs.map((activityLog) =>
        this.toGrpcActivityLog(activityLog),
      ),
    };
  }

  private toGrpcActivityLog(activityLog: ActivityLog): ActivityLogGrpc {
    return {
      logId: activityLog.logId,
      userId: activityLog.userId ?? '',
      username: activityLog.username ?? '',
      action: activityLog.action ?? '',
      referenceType: activityLog.referenceType ?? '',
      referenceId: activityLog.referenceId ?? '',
      description: activityLog.description ?? '',
      createdAt: activityLog.createdAt?.toISOString() ?? '',
    };
  }
}
