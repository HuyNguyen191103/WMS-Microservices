import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InboundItem } from '../../inbound/entities/inbound-item.entity';
import { InventoryItem } from '../../inventory/entities/inventory-item.entity';
import { InventoryTransaction } from '../../inventory/entities/inventory-transaction.entity';
import { OutboundItem } from '../../outbound/entities/outbound-item.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid', { name: 'product_id' })
  productId!: string;

  @Column({ length: 50, nullable: false })
  sku!: string;

  @Column({
    name: 'product_name',
    length: 255,
    nullable: false,
  })
  productName!: string;

  @Column({ nullable: true })
  description!: string | null;

  @Column({length: 100, nullable: true })
  category!: string | null;

  @Column({ length: 50, nullable: true })
  unit!: string | null;

  @Column({ length: 30, nullable: true })
  status!: string | null;

  @Column({ name: 'created_by', length: 100, nullable: true })
  createdBy!: string | null;

  @Column({ name: 'updated_by', length: 100, nullable: true })
  updatedBy!: string | null;

  @Column({ name: 'created_at', nullable: true })
  createdAt!: Date | null;

  @Column({ name: 'updated_at', nullable: true })
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
