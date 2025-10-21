import type { UserRole } from '../database/entities/User';

export interface IUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface IApartment {
  id: string;
  title: string;
  description: string;
  location: string;
  pricePerNight: number;
  amenities: string[];
  hostId: string;
  hostName: string;
  createdAt: Date;
}

export interface IPaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface IBooking {
  id: string;
  apartmentId: string;
  guestId: string;
  guestName: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: Date;
}
