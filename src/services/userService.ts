import bcrypt from 'bcryptjs';
import { User } from '../database/entities/User';
import { getDataSource } from '../database';
import type { LoginDto, RegisterDto } from '../dto/AuthDto';
import { IUser } from '../interfaces';
import { AppError, UnauthorizedError } from '../utils/errors';

class UserService {
  private mapUser(entity: User): IUser {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      role: entity.role,
      createdAt: entity.createdAt
    };
  }

  async registerUser(input: RegisterDto): Promise<IUser> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(User);

    const existing = await repository.findOne({ where: { email: input.email.toLowerCase() } });
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(input.password, 10);
    const user = repository.create({
      name: input.name,
      email: input.email.toLowerCase(),
      passwordHash: hashedPassword,
      role: input.role ?? 'host'
    });

    const saved = await repository.save(user);
    return this.mapUser(saved);
  }

  async authenticateUser(input: LoginDto): Promise<IUser> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(User);
    const user = await repository.findOne({ where: { email: input.email.toLowerCase() } });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    return this.mapUser(user);
  }

  async getUserById(id: string): Promise<IUser | null> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(User);
    const user = await repository.findOne({ where: { id } });
    return user ? this.mapUser(user) : null;
  }
}

export const userService = new UserService();
