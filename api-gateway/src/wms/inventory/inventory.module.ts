import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { WmsGrpcClientModule } from '../grpc/wms-grpc-client.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [AuthModule, WmsGrpcClientModule],
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
