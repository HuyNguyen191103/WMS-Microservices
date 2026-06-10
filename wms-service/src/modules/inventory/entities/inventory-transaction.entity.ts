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

  @Column({ name: 'product_id', type: 'uuid', nullable: false })
  productId!: string;

  @Column({ name: 'warehouse_id', type: 'uuid', nullable: false })
  warehouseId!: string;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId!: string | null;

  @Column({
    name: 'transaction_type',
    type: 'varchar',
    length: 30,
    nullable: true,
  })
  transactionType!: string | null;

  @Column({ name: 'quantity', type: 'int4', nullable: true })
  quantity!: number | null;

  @Column({ name: 'reference_no', type: 'varchar', length: 50, nullable: true })
  referenceNo!: string | null;

  @Column({ name: 'created_by', type: 'varchar', length: 100, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt!: Date | null;

  @ManyToOne(() => Product, (product) => product.inventoryTransactions)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'productId' })
  product!: Product;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.inventoryTransactions)
  @JoinColumn({ name: 'warehouse_id', referencedColumnName: 'warehouseId' })
  warehouse!: Warehouse;

  @ManyToOne(() => WarehouseLocation, (location) => location.inventoryTransactions)
  @JoinColumn({ name: 'location_id', referencedColumnName: 'locationId' })
  location!: WarehouseLocation | null;
}
