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

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({ name: 'location_id' })
  locationId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'quantity', default: 0 })
  quantity!: number;

  @Column({ name: 'updated_at' })
  updatedAt!: Date;

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
