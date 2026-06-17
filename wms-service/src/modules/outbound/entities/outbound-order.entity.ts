import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { OutboundItem } from './outbound-item.entity';

@Entity('outbound_orders')
export class OutboundOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'outbound_order_id' })
  outboundOrderId!: string;

  @Column({ name: 'outbound_no', length: 50 })
  outboundNo!: string;

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({
    name: 'customer_name',
    length: 255,
  })
  customerName!: string;

  @Column({
    name: 'customer_phone',
    length: 30,
  })
  customerPhone!: string;

  @Column({
    name: 'customer_mail',
    length: 255,
  })
  customerMail!: string;

  @Column({ name: 'status', length: 30 })
  status!: string;

  @Column({ name: 'approved_by', length: 100 })
  approvedBy!: string;

  @Column({ name: 'approved_at' })
  approvedAt!: Date;

  @Column({ name: 'created_by', length: 100 })
  createdBy!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.outboundOrders)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => OutboundItem, (outboundItem) => outboundItem.outboundOrder)
  items!: OutboundItem[];
}
