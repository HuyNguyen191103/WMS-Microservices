import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { OutboundOrder } from './outbound-order.entity';

@Entity('outbound_items')
export class OutboundItem {
  @PrimaryGeneratedColumn('uuid', { name: 'outbound_item_id' })
  outboundItemId!: string;

  @Column({ name: 'outbound_order_id', type: 'uuid', nullable: false })
  outboundOrderId!: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ name: 'requested_qty', type: 'int4', nullable: true })
  requestedQty!: number | null;

  @Column({ name: 'actual_qty', type: 'int4', nullable: true })
  actualQty!: number | null;

  @ManyToOne(() => OutboundOrder, (outboundOrder) => outboundOrder.items)
  @JoinColumn({
    name: 'outbound_order_id',
    referencedColumnName: 'outboundOrderId',
  })
  outboundOrder!: OutboundOrder;

  @ManyToOne(() => Product, (product) => product.outboundItems)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;
}
