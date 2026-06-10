import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid', { name: 'log_id' })
  logId!: string;

  @Column({ name: 'user_id', length: 100, nullable: true })
  userId!: string | null;

  @Column({ name: 'user_role', length: 30, nullable: true })
  userRole!: string | null;

  @Column({ name: 'action', length: 100, nullable: true })
  action!: string | null;

  @Column({ name: 'reference_type', length: 50, nullable: true })
  referenceType!: string | null;

  @Column({ name: 'reference_id', nullable: true })
  referenceId!: string | null;

  @Column({ name: 'description', nullable: true })
  description!: string | null;

  @Column({ name: 'created_at', nullable: true })
  createdAt!: Date | null;
}
