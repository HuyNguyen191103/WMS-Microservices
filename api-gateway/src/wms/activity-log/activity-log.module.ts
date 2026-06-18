import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WmsGrpcClientModule } from '../grpc/wms-grpc-client.module';
import { ActivityLogController } from './activity-log.controller';
import { ActivityLogService } from './activity-log.service';

@Module({
  imports: [AuthModule, WmsGrpcClientModule],
  controllers: [ActivityLogController],
  providers: [ActivityLogService],
})
export class ActivityLogModule {}
