import request from 'supertest';
import type { DataSource } from 'typeorm';
import { createApp } from '../../src/app';
import { createTestDataSource } from '../utils/testDb';

describe('Shortlet API integration', () => {
  let dataSource: DataSource;
  let hostToken: string;
  let guestToken: string;
  let apartmentId: string;
  const appFactory = () => createApp(dataSource);

  beforeAll(async () => {
    ({ dataSource } = await createTestDataSource());

    const app = appFactory();

    const hostResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Host User',
        email: 'host@example.com',
        password: 'password123',
        role: 'host'
      });

    hostToken = hostResponse.body.token;

    const guestResponse = await request(app)
      .post('/auth/register')
      .send({
        name: 'Guest User',
        email: 'guest@example.com',
        password: 'password123',
        role: 'guest'
      });

    guestToken = guestResponse.body.token;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  test('host can create and retrieve an apartment', async () => {
    const app = appFactory();
    const createResponse = await request(app)
      .post('/apartments')
      .set('Authorization', `Bearer ${hostToken}`)
      .send({
        title: 'Cozy Loft',
        description: 'Bright loft in city center',
        location: 'Lagos',
        pricePerNight: 120,
        amenities: ['wifi', 'air conditioning']
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.title).toBe('Cozy Loft');
    apartmentId = createResponse.body.id;

    const listResponse = await request(app).get('/apartments').query({ location: 'Lagos' });
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.items).toHaveLength(1);
    expect(listResponse.body.items[0].id).toBe(apartmentId);

    const detailResponse = await request(app).get(`/apartments/${apartmentId}`);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.id).toBe(apartmentId);
  });

  test('guest can create bookings and overlapping bookings are rejected', async () => {
    const app = appFactory();

    const createBookingResponse = await request(app)
      .post(`/apartments/${apartmentId}/bookings`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        startDate: '2024-08-01',
        endDate: '2024-08-05'
      });

    expect(createBookingResponse.status).toBe(201);
    expect(createBookingResponse.body.totalPrice).toBeGreaterThan(0);

    const conflictResponse = await request(app)
      .post(`/apartments/${apartmentId}/bookings`)
      .set('Authorization', `Bearer ${guestToken}`)
      .send({
        startDate: '2024-08-03',
        endDate: '2024-08-06'
      });

    expect(conflictResponse.status).toBe(409);

    const bookingsResponse = await request(app)
      .get(`/apartments/${apartmentId}/bookings`)
      .set('Authorization', `Bearer ${guestToken}`);

    expect(bookingsResponse.status).toBe(200);
    expect(bookingsResponse.body).toHaveLength(1);
  });

  test('rejects unauthenticated apartment creation', async () => {
    const app = appFactory();
    const response = await request(app).post('/apartments').send({
      title: 'Unauthorized',
      description: 'Should not be created',
      location: 'Accra',
      pricePerNight: 90,
      amenities: []
    });

    expect(response.status).toBe(401);
  });
});
