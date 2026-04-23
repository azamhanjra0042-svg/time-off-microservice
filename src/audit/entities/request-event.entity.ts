import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RequestEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  requestId!: string;

  @Column({ type: 'text' })
  eventType!: string;

  @Column({ type: 'text', nullable: true })
  fromStatus!: string | null;

  @Column({ type: 'text', nullable: true })
  toStatus!: string | null;

  @Column({ type: 'simple-json', nullable: true })
  payload!: any;

  @CreateDateColumn()
  createdAt!: Date;
}