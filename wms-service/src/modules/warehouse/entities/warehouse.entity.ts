import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InboundOrder } from '../../inbound/entities/inbound-order.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { OutboundOrder } from '../../outbound/entities/outbound-order.entity';
import { WarehouseLocation } from './warehouse-location.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid', { name: 'warehouse_id' })
  warehouseId!: string;

  @Column({
    name: 'warehouse_code',
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  warehouseCode!: string;

  @Column({
    name: 'warehouse_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  warehouseName!: string;

  @Column({ name: 'address', type: 'text', nullable: true })
  address!: string | null;

  @Column({ name: 'status', type: 'varchar', length: 30, nullable: true })
  status!: string | null;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', type: 'varchar', length: 100, nullable: true })
  updatedBy!: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @OneToMany(() => WarehouseLocation, (location) => location.warehouse)
  locations!: WarehouseLocation[];

  @OneToMany(() => InboundOrder, (inboundOrder) => inboundOrder.warehouse)
  inboundOrders!: InboundOrder[];

  @OneToMany(() => OutboundOrder, (outboundOrder) => outboundOrder.warehouse)
  outboundOrders!: OutboundOrder[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.warehouse)
  inventoryItems!: InventoryItem[];

  @OneToMany(
    () => InventoryTransaction,
    (inventoryTransaction) => inventoryTransaction.warehouse,
  )
  inventoryTransactions!: InventoryTransaction[];
}
