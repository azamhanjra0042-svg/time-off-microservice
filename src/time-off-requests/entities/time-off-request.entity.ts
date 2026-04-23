import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class TimeOffRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  employeeId: string;

  @Column({ type: 'text' })
  locationId: string;

  @Column({ type: 'float' })
  amount: number;

  @Column({ type: 'text' })
  status: string;

  @Column({ type: 'text', nullable: true })
  failureReason: string | null;

  @Column({ type: 'text' })
  idempotencyKey: string;

  @Column({ type: 'text', nullable: true })
  externalReference: string | null;
}