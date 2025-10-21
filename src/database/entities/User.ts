import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Apartment } from './Apartment';
import { Booking } from './Booking';

export type UserRole = 'host' | 'guest';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'text', unique: true })
  email!: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash!: string;

  @Column({ type: 'enum', enum: ['host', 'guest'], default: 'host' })
  role!: UserRole;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @OneToMany(() => Apartment, (apartment) => apartment.host)
  apartments!: Apartment[];

  @OneToMany(() => Booking, (booking) => booking.guest)
  bookings!: Booking[];
}
