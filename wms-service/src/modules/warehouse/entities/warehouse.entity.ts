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
    length: 50,
  })
  warehouseCode!: string;

  @Column({
    name: 'warehouse_name',
    length: 255,
  })
  warehouseName!: string;

  @Column({ name: 'address' })
  address!: string;

  @Column({ name: 'status', length: 30 })
  status!: string;

  @Column({ name: 'created_by', length: 100 })
  createdBy!: string;

  @Column({ name: 'updated_by', length: 100 })
  updatedBy!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_at' })
  updatedAt!: Date;

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
