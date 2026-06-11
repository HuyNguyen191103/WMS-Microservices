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

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({ name: 'zone', type: 'varchar', length: 50, nullable: true })
  zone!: string | null;

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
