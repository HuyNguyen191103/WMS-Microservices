import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { WarehouseLocation } from '../../warehouse/entities/warehouse-location.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('inventory_items')
@Unique('uq_inventory', ['warehouseId', 'locationId', 'productId'])
export class InventoryItem {
  @PrimaryGeneratedColumn('uuid', { name: 'inventory_id' })
  inventoryId!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: false })
  locationId!: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ name: 'quantity', type: 'int4', nullable: true, default: 0 })
  quantity!: number | null;

  @Column({ name: 'updated_at', type: 'timestamp', nullable: true })
  updatedAt!: Date | null;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventoryItems)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @ManyToOne(() => WarehouseLocation, (location) => location.inventoryItems)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
  location!: WarehouseLocation;

  @ManyToOne(() => Product, (product) => product.inventoryItems)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;
}
