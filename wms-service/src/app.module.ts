import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { InboundModule } from './modules/inbound/inbound.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { OutboundModule } from './modules/outbound/outbound.module';
import { ProductModule } from './modules/product/product.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.wms', '.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost')?.trim(),
        port: Number(configService.get<string>('DB_PORT', '5432')?.trim()),
        username: configService.get<string>('DB_USERNAME')?.trim(),
        password: configService.get<string>('DB_PASSWORD')?.trim(),
        database: configService.get<string>('DB_NAME')?.trim(),
        synchronize: false,
        autoLoadEntities: true,
      }),
    }),
    ProductModule,
    WarehouseModule,
    InboundModule,
    OutboundModule,
    InventoryModule,
    ActivityLogModule,
  ],
})
export class AppModule {}
