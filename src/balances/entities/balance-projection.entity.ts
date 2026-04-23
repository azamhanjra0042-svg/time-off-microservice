import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity('balance_projections')
@Unique(['employeeId', 'locationId'])
export class BalanceProjection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  employeeId: string;

  @Column()
  locationId: string;

  @Column('float', { default: 0 })
  hcmBalanceAmount: number;

  @Column('float', { default: 0 })
  pendingRequestAmount: number;

  @Column('float', { default: 0 })
  approvedUnsettledAmount: number;

  @Column('float', { default: 0 })
  projectedAvailableAmount: number;

  @Column({ default: 'fresh' })
  syncStatus: string;

  @Column({ type: 'datetime', nullable: true })
  lastRealtimeSyncAt: Date | null;

  @Column({ type: 'datetime', nullable: true })
  lastBatchSyncAt: Date | null;

  @Column({ default: 0 })
  version: number;
}