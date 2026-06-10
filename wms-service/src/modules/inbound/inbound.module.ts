import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InboundItem } from './entities/inbound-item.entity';
import { InboundOrder } from './entities/inbound-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InboundOrder, InboundItem])],
})
export class InboundModule {}
