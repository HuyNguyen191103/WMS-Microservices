import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  logId!: string;

  @Column({ name: 'user_id', type: 'varchar', length: 100, nullable: true })
  userId!: string | null;

  @Column({ name: 'username', type: 'varchar', length: 100, nullable: true })
  username!: string | null;

  @Column({ name: 'action', type: 'varchar', length: 100, nullable: true })
  action!: string | null;

  @Column({ name: 'reference_type', type: 'varchar', length: 50, nullable: true })
  referenceType!: string | null;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId!: string | null;

  @Column({ name: 'description', type: 'text', nullable: true })
  description!: string | null;

  @Column({ name: 'created_at', type: 'timestamp', nullable: true })
  createdAt!: Date | null;
}
