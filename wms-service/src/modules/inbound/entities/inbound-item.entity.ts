import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { WarehouseLocation } from '../../warehouse/entities/warehouse-location.entity';
import { InboundOrder } from './inbound-order.entity';

@Entity('inbound_items')
export class InboundItem {
  @PrimaryGeneratedColumn('uuid', { name: 'inbound_item_id' })
  inboundItemId!: string;

  @Column({ name: 'inbound_order_id' })
  inboundOrderId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'location_id' })
  locationId!: string;

  @Column({ name: 'actual_qty' })
  actualQty!: number;

  @ManyToOne(() => InboundOrder, (inboundOrder) => inboundOrder.items)
  @JoinColumn({
    name: 'inbound_order_id',
    referencedColumnName: 'inboundOrderId',
  })
  inboundOrder!: InboundOrder;

  @ManyToOne(() => Product, (product) => product.inboundItems)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;

  @ManyToOne(() => WarehouseLocation, (location) => location.inboundItems)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
  location!: WarehouseLocation;
}
