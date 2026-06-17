import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InboundItem } from '../../inbound/entities/inbound-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { OutboundItem } from '../../outbound/entities/outbound-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId!: string;

  @Column({ name: 'sku', length: 50 })
  sku!: string;

  @Column({
    name: 'product_name',
    length: 255,
  })
  productName!: string;

  @Column({ name: 'description' })
  description!: string;

  @Column({ name: 'category', length: 100 })
  category!: string;

  @Column({ name: 'unit', length: 50 })
  unit!: string;

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
