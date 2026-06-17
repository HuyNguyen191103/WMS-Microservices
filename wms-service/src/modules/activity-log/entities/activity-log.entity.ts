import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  logId!: string;

  @Column({ name: 'user_id', length: 100 })
  userId!: string;

  @Column({ name: 'username', length: 100 })
  username!: string;

  @Column({ name: 'action', length: 100 })
  action!: string;

  @Column({ name: 'reference_type', length: 50 })
  referenceType!: string;

  @Column({ name: 'reference_id' })
  referenceId!: string;

  @Column({ name: 'description' })
  description!: string;

  @Column({ name: 'created_at' })
  createdAt!: Date;
}
