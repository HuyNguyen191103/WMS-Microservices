import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { ActivityLog } from './entities/activity-log.entity';
import { ActivityLogGrpc } from './grpc/activity-log-grpc.types';

const PAGE_SIZE = 20;

export interface CreateActivityLogRequest {
  userId: string;
  username: string;
  action: string;
  referenceType: string;
  referenceId: string;
  description: string;
}

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepository: Repository<ActivityLog>,
  ) {}

  async createActivityLog(
    request: CreateActivityLogRequest,
    manager?: EntityManager,
  ) {
    const activityLogData = {
      userId: request.userId,
      username: request.username,
      action: request.action,
      referenceType: request.referenceType,
      referenceId: request.referenceId,
      description: request.description,
      createdAt: new Date(),
    };

    if (manager) {
      await manager.save(manager.create(ActivityLog, activityLogData));
      return;
    }

    await this.activityLogRepository.save(
      this.activityLogRepository.create(activityLogData),
    );
  }

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
