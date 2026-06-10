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

  @Column({ name: 'outbound_no', type: 'varchar', length: 50, nullable: false })
  outboundNo!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({
    name: 'customer_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerName!: string | null;

  @Column({
    name: 'customer_phone',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  customerPhone!: string | null;

  @Column({
    name: 'customer_mail',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  customerMail!: string | null;

  @Column({ name: 'status', type: 'varchar', length: 30, nullable: true })
  status!: string | null;

  @Column({ name: 'approved_by', type: 'varchar', length: 100, nullable: true })
  approvedBy!: string | null;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt!: Date | null;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.outboundOrders)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => OutboundItem, (outboundItem) => outboundItem.outboundOrder)
  items!: OutboundItem[];
}
