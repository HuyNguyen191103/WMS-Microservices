import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WmsGrpcClientModule } from '../grpc/wms-grpc-client.module';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

@Module({
  imports: [AuthModule, WmsGrpcClientModule],
  controllers: [WarehouseController],
  providers: [WarehouseService],
})
export class WarehouseModule {}
