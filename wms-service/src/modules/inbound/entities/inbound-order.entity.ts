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

  @Column({ name: 'inbound_no', type: 'varchar', length: 50, nullable: false })
  inboundNo!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({
    name: 'supplier_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  supplierName!: string | null;

  @Column({ name: 'expected_date', type: 'date', nullable: true })
  expectedDate!: Date | null;

  @Column({ name: 'actual_date', type: 'date', nullable: true })
  actualDate!: Date | null;

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

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inboundOrders)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => InboundItem, (inboundItem) => inboundItem.inboundOrder)
  items!: InboundItem[];
}
