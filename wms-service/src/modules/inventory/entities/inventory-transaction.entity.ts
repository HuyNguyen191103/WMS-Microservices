import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Product } from '../../product/entities/product.entity';
import { WarehouseLocation } from '../../warehouse/entities/warehouse-location.entity';
import { Warehouse } from '../../warehouse/entities/warehouse.entity';

@Entity('inventory_transactions')
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid', { name: 'transaction_id' })
  transactionId!: string;

  @Column({ name: 'product_id' })
  productId!: string;

  @Column({ name: 'warehouse_id' })
  warehouseId!: string;

  @Column({ name: 'location_id' })
  locationId!: string;

  @Column({
    name: 'transaction_type',
    length: 30,
  })
  transactionType!: string;

  @Column({ name: 'quantity' })
  quantity!: number;

  @Column({ name: 'reference_no', length: 50 })
  referenceNo!: string;

  @Column({ name: 'created_by', length: 100 })
  createdBy!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;

  @ManyToOne(() => Product, (product) => product.inventoryTransactions)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventoryTransactions)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @ManyToOne(
    () => WarehouseLocation,
    (location) => location.inventoryTransactions,
  )
  @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
  location!: WarehouseLocation;
}
