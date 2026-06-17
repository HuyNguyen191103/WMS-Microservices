import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { InboundItem } from '../../inbound/entities/inbound-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { Warehouse } from './warehouse.entity';

@Entity('warehouse_locations')
export class WarehouseLocation {
  @PrimaryGeneratedColumn('uuid', { name: 'location_id' })
  locationId!: string;

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({ name: 'zone', length: 50 })
  zone!: string;

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

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.locations)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @OneToMany(() => InboundItem, (inboundItem) => inboundItem.location)
  inboundItems!: InboundItem[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.location)
  inventoryItems!: InventoryItem[];

  @OneToMany(
    () => InventoryTransaction,
    (inventoryTransaction) => inventoryTransaction.location,
  )
  inventoryTransactions!: InventoryTransaction[];
}
