import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutboundItem } from './entities/outbound-item.entity';
import { OutboundOrder } from './entities/outbound-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutboundOrder, OutboundItem])],
})
export class OutboundModule {}
