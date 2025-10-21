import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './User';
import { Booking } from './Booking';

const numericTransformer = {
  to: (value: number) => value,
  from: (value: string | null): number => (value ? Number(value) : 0)
};

@Entity({ name: 'apartments' })
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ type: 'text' })
  location!: string;

  @Column({ name: 'price_per_night', type: 'numeric', precision: 10, scale: 2, transformer: numericTransformer })
  pricePerNight!: number;

  @Column('text', { array: true, default: () => 'ARRAY[]::text[]' })
  amenities!: string[];

  @ManyToOne(() => User, (user) => user.apartments, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host!: User;

  @OneToMany(() => Booking, (booking) => booking.apartment)
  bookings!: Booking[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
