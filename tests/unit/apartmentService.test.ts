import { DataSource } from 'typeorm';
import { randomUUID } from 'node:crypto';
import { apartmentService } from '../../src/services/apartmentService';
import { createTestDataSource } from '../utils/testDb';
import { getDataSource } from '../../src/database';
import { User } from '../../src/database/entities/User';
import { AppError, NotFoundError } from '../../src/utils/errors';

describe('apartmentService', () => {
  let dataSource: DataSource;
  let hostId: string;

  beforeAll(async () => {
    ({ dataSource } = await createTestDataSource());
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    // Clear tables between tests to keep assertions deterministic.
    await dataSource.query('TRUNCATE TABLE "bookings" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "apartments" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');

    const repository = getDataSource().getRepository(User);
    const host = repository.create({
      name: 'Host One',
      email: 'host@example.com',
      passwordHash: 'hashed',
      role: 'host'
    });
    const saved = await repository.save(host);
    hostId = saved.id;
  });

  it('creates an apartment for an existing host', async () => {
    const apartment = await apartmentService.createApartment(
      {
        title: 'City Loft',
        description: 'A bright loft in the city centre',
        location: 'Lagos',
        pricePerNight: 120,
        amenities: ['wifi']
      },
      hostId
    );

    expect(apartment.title).toBe('City Loft');
    expect(apartment.hostId).toBe(hostId);
    expect(apartment.amenities).toContain('wifi');
  });

  it('throws when the host cannot be found', async () => {
    // Attempting to create with an invalid host id should be rejected.
    await expect(
      apartmentService.createApartment(
        {
          title: 'Missing Host Apartment',
          description: 'Should fail',
          location: 'Abuja',
          pricePerNight: 90,
          amenities: []
        },
        randomUUID()
      )
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it('lists apartments with filters applied', async () => {
    await apartmentService.createApartment(
      {
        title: 'Beach House',
        description: 'Steps to the ocean',
        location: 'Lagos',
        pricePerNight: 250,
        amenities: ['pool', 'wifi']
      },
      hostId
    );

    await apartmentService.createApartment(
      {
        title: 'Mountain Cabin',
        description: 'Quiet retreat',
        location: 'Accra',
        pricePerNight: 150,
        amenities: ['fireplace']
      },
      hostId
    );

    const result = await apartmentService.listApartments({ location: 'Lagos', page: 1, pageSize: 10 });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].title).toBe('Beach House');
  });
});
