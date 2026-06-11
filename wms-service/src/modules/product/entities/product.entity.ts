import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InboundItem } from '../../inbound/entities/inbound-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { OutboundItem } from '../../outbound/entities/outbound-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId!: string;

  @Column({ name: 'sku', type: 'varchar', length: 50, nullable: false })
  sku!: string;

  @Column({
    name: 'product_name',
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  productName!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'category', type: 'varchar', length: 100, nullable: true })
  category!: string | null;

  @Column({ name: 'unit', type: 'varchar', length: 50, nullable: true })
  unit!: string | null;

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

  @OneToMany(() => InboundItem, (inboundItem) => inboundItem.product)
  inboundItems!: InboundItem[];

  @OneToMany(() => OutboundItem, (outboundItem) => outboundItem.product)
  outboundItems!: OutboundItem[];

  @OneToMany(() => InventoryItem, (inventoryItem) => inventoryItem.product)
  inventoryItems!: InventoryItem[];

  @OneToMany(
    () => InventoryTransaction,
    (inventoryTransaction) => inventoryTransaction.product,
  )
  inventoryTransactions!: InventoryTransaction[];
}
