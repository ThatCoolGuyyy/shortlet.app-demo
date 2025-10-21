import { Apartment } from '../database/entities/Apartment';
import { Booking } from '../database/entities/Booking';
import { User } from '../database/entities/User';
import { getDataSource } from '../database';
import type { CreateBookingDto } from '../dto/BookingDto';
import { IBooking } from '../interfaces';
import { AppError, NotFoundError } from '../utils/errors';

class BookingService {
  private mapBooking(entity: Booking): IBooking {
    return {
      id: entity.id,
      apartmentId: entity.apartment.id,
      guestId: entity.guest.id,
      guestName: entity.guest.name,
      startDate: entity.startDate,
      endDate: entity.endDate,
      totalPrice: entity.totalPrice,
      createdAt: entity.createdAt
    };
  }

  async createBooking(apartmentId: string, guestId: string, input: CreateBookingDto): Promise<IBooking> {
    const dataSource = getDataSource();
    const apartmentRepository = dataSource.getRepository(Apartment);
    const bookingRepository = dataSource.getRepository(Booking);
    const userRepository = dataSource.getRepository(User);

    const apartment = await apartmentRepository.findOne({ where: { id: apartmentId } });
    if (!apartment) {
      throw new NotFoundError('Apartment not found');
    }

    const guest = await userRepository.findOne({ where: { id: guestId } });
    if (!guest) {
      throw new NotFoundError('Guest not found');
    }

    const startDate = input.startDate.toISOString().split('T')[0];
    const endDate = input.endDate.toISOString().split('T')[0];

    const overlapping = await bookingRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.apartment', 'apartment')
      .where('apartment.id = :apartmentId', { apartmentId })
      .andWhere('NOT (:start >= booking.endDate OR :end <= booking.startDate)', {
        start: startDate,
        end: endDate
      })
      .getOne();

    if (overlapping) {
      throw new AppError('Booking dates overlap with an existing reservation', 409);
    }

    const nights = Math.ceil((input.endDate.getTime() - input.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalPrice = nights * apartment.pricePerNight;

    const booking = bookingRepository.create({
      apartment,
      guest,
      startDate,
      endDate,
      totalPrice
    });

    const saved = await bookingRepository.save(booking);
    const reloaded = await bookingRepository.findOneOrFail({ where: { id: saved.id } });
    return this.mapBooking(reloaded);
  }

  async listBookingsForApartment(apartmentId: string): Promise<IBooking[]> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(Booking);

    const bookings = await repository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.guest', 'guest')
      .leftJoinAndSelect('booking.apartment', 'apartment')
      .where('apartment.id = :apartmentId', { apartmentId })
      .orderBy('booking.startDate', 'ASC')
      .getMany();

    return bookings.map(booking => this.mapBooking(booking));
  }
}

export const bookingService = new BookingService();
