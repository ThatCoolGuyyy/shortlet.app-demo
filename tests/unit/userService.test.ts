import { DataSource } from 'typeorm';
import { userService } from '../../src/services/userService';
import { createTestDataSource } from '../utils/testDb';
import { AppError, UnauthorizedError } from '../../src/utils/errors';

describe('userService', () => {
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ dataSource } = await createTestDataSource());
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE "bookings" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "apartments" RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
  });

  it('registers a new user and hashes their password', async () => {
    const user = await userService.registerUser({
      name: 'Alice',
      email: 'alice@example.com',
      password: 'StrongPass123',
      role: 'host'
    });

    expect(user.name).toBe('Alice');
    expect(user.email).toBe('alice@example.com');
    expect(user.role).toBe('host');
  });

  it('prevents duplicate registrations by email', async () => {
    await userService.registerUser({
      name: 'Bob',
      email: 'bob@example.com',
      password: 'Password123',
      role: 'guest'
    });

    await expect(
      userService.registerUser({
        name: 'Bob Duplicate',
        email: 'bob@example.com',
        password: 'Password123',
        role: 'guest'
      })
    ).rejects.toBeInstanceOf(AppError);
  });

  it('authenticates a user with correct credentials', async () => {
    await userService.registerUser({
      name: 'Charlie',
      email: 'charlie@example.com',
      password: 'securePass!',
      role: 'host'
    });

    const authenticated = await userService.authenticateUser({
      email: 'charlie@example.com',
      password: 'securePass!'
    });

    expect(authenticated.email).toBe('charlie@example.com');
  });

  it('rejects invalid credentials', async () => {
    await userService.registerUser({
      name: 'Dana',
      email: 'dana@example.com',
      password: 'danaSecret',
      role: 'guest'
    });

    await expect(
      userService.authenticateUser({
        email: 'dana@example.com',
        password: 'wrongPassword'
      })
    ).rejects.toBeInstanceOf(UnauthorizedError);
  });

  it('retrieves a user by id', async () => {
    const user = await userService.registerUser({
      name: 'Eve',
      email: 'eve@example.com',
      password: 'eveSecret',
      role: 'host'
    });

    const fetched = await userService.getUserById(user.id);
    expect(fetched?.email).toBe('eve@example.com');
  });
});
