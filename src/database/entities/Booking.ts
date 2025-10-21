import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn
} from 'typeorm';
import { Apartment } from './Apartment';
import { User } from './User';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string | null): number => (value ? Number(value) : 0)
};

@Entity({ name: 'bookings' })
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Apartment, (apartment) => apartment.bookings, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'apartment_id' })
  apartment!: Apartment;

  @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'guest_id' })
  guest!: User;

  @Column({ name: 'start_date', type: 'date' })
  startDate!: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate!: string;

  @Column({ name: 'total_price', type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  totalPrice!: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
