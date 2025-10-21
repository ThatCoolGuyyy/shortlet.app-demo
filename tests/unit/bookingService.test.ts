import { DataSource } from 'typeorm';
import { bookingService } from '../../src/services/bookingService';
import { apartmentService } from '../../src/services/apartmentService';
import { userService } from '../../src/services/userService';
import { createTestDataSource } from '../utils/testDb';
import type { CreateBookingDto } from '../../src/dto/BookingDto';
import { AppError } from '../../src/utils/errors';

describe('bookingService', () => {
  let dataSource: DataSource;
  let apartmentId: string;
  let guestId: string;

  beforeAll(async () => {
    ({ dataSource } = await createTestDataSource());
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // pg-mem does not yet support truncating several tables at once, so we
    // reset each table individually to keep state isolated between tests.
    await dataSource.query('TRUNCATE TABLE "bookings" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "apartments" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');

    const host = await userService.registerUser({
      name: 'Host User',
      email: 'host@example.com',
      password: 'password123',
      role: 'host'
    });

    const guest = await userService.registerUser({
      name: 'Guest User',
      email: 'guest@example.com',
      password: 'password123',
      role: 'guest'
    });

    guestId = guest.id;

    const apartment = await apartmentService.createApartment(
      {
        title: 'Ocean View Suite',
        description: 'Beautiful ocean view apartment',
        location: 'Lagos',
        pricePerNight: 100,
        amenities: ['wifi', 'pool']
      },
      host.id
    );

    apartmentId = apartment.id;
  });

  it('creates a booking and calculates the total price', async () => {
    const payload: CreateBookingDto = {
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-02-04')
    };

    const booking = await bookingService.createBooking(apartmentId, guestId, payload);

    expect(booking.apartmentId).toBe(apartmentId);
    expect(booking.guestId).toBe(guestId);
    expect(booking.totalPrice).toBe(300); // 3 nights * 100
  });

  it('prevents overlapping bookings for the same apartment', async () => {
    const firstBooking: CreateBookingDto = {
      startDate: new Date('2024-03-10'),
      endDate: new Date('2024-03-15')
    };

    await bookingService.createBooking(apartmentId, guestId, firstBooking);

    const overlapping: CreateBookingDto = {
      startDate: new Date('2024-03-12'),
      endDate: new Date('2024-03-18')
    };

    await expect(bookingService.createBooking(apartmentId, guestId, overlapping)).rejects.toBeInstanceOf(
      AppError
    );
  });

  it('lists bookings for an apartment', async () => {
    await bookingService.createBooking(apartmentId, guestId, {
      startDate: new Date('2024-04-01'),
      endDate: new Date('2024-04-03')
    });

    const bookings = await bookingService.listBookingsForApartment(apartmentId);
    expect(bookings).toHaveLength(1);
    expect(bookings[0].guestName).toBe('Guest User');
  });
});
