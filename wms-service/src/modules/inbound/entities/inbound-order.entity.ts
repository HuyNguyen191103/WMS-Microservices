import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';
import { InboundItem } from './inbound-item.entity';

@Entity('inbound_orders')
export class InboundOrder {
  @PrimaryGeneratedColumn('uuid', { name: 'inbound_order_id' })
  inboundOrderId!: string;

  @Column({ name: 'inbound_no', length: 50 })
  inboundNo!: string;

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({
    name: 'supplier_name',
    length: 255,
  })
  supplierName!: string;

  @Column({ name: 'actual_date' })
  actualDate!: Date;

  @Column({ name: 'status', length: 30 })
  status!: string;

  @Column({ name: 'created_by', length: 100 })
  createdBy!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  updatedAt!: Date;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inboundOrders)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => InboundItem, (inboundItem) => inboundItem.inboundOrder)
  items!: InboundItem[];
}
