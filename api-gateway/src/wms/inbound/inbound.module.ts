import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WmsGrpcClientModule } from '../grpc/wms-grpc-client.module';
import { InboundController } from './inbound.controller';
import { InboundService } from './inbound.service';

@Module({
  imports: [AuthModule, WmsGrpcClientModule],
  controllers: [InboundController],
  providers: [InboundService],
})
export class InboundModule {}
