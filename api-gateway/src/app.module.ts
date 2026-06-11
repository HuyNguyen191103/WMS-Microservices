import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ActivityLogModule } from './wms/activity-log/activity-log.module';
import { ProductModule } from './wms/product/product.module';
import { WarehouseModule } from './wms/warehouse/warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProductModule,
    WarehouseModule,
    ActivityLogModule,
  ],
})
export class AppModule {}
