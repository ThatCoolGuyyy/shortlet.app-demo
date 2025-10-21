import { Apartment } from '../database/entities/Apartment';
import { User } from '../database/entities/User';
import { getDataSource } from '../database';
import type { CreateApartmentDto, ListApartmentsDto } from '../dto/ApartmentDto';
import { IApartment, IPaginatedResult } from '../interfaces';
import { AppError, NotFoundError } from '../utils/errors';

class ApartmentService {
  private mapApartment(entity: Apartment): IApartment {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      location: entity.location,
      pricePerNight: entity.pricePerNight,
      amenities: entity.amenities ?? [],
      hostId: entity.host.id,
      hostName: entity.host.name,
      createdAt: entity.createdAt
    };
  }

  async createApartment(input: CreateApartmentDto, hostId: string): Promise<IApartment> {
    const dataSource = getDataSource();
    const apartmentRepository = dataSource.getRepository(Apartment);
    const userRepository = dataSource.getRepository(User);

    const host = await userRepository.findOne({ where: { id: hostId } });
    if (!host) {
      throw new NotFoundError('Host not found');
    }

    const apartment = apartmentRepository.create({
      title: input.title,
      description: input.description,
      location: input.location,
      pricePerNight: input.pricePerNight,
      amenities: input.amenities ?? [],
      host
    });

    const saved = await apartmentRepository.save(apartment);
    if (!saved) {
      throw new AppError('Failed to create apartment', 500);
    }

    return this.mapApartment(saved);
  }

  async listApartments(filters: ListApartmentsDto): Promise<IPaginatedResult<IApartment>> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(Apartment);
    const page = filters.page ?? 1;
    const hasPagination = typeof filters.pageSize === 'number';
    const pageSize = hasPagination ? Number(filters.pageSize) : undefined;
    const offset = hasPagination && pageSize ? (page - 1) * pageSize : undefined;

    const query = repository
      .createQueryBuilder('apartment')
      .leftJoinAndSelect('apartment.host', 'host')
      .orderBy('apartment.createdAt', 'DESC');

    if (hasPagination && pageSize) {
      query.skip(offset ?? 0);
      query.take(pageSize);
    }

    if (filters.location) {
      query.andWhere('LOWER(apartment.location) = LOWER(:location)', { location: filters.location });
    }

    if (typeof filters.minPrice === 'number') {
      query.andWhere('apartment.pricePerNight >= :minPrice', { minPrice: filters.minPrice });
    }

    if (typeof filters.maxPrice === 'number') {
      query.andWhere('apartment.pricePerNight <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.amenities?.length) {
      query.andWhere('apartment.amenities @> :amenities', { amenities: filters.amenities });
    }

    const [results, total] = await query.getManyAndCount();

    const items = results.map(apartment => this.mapApartment(apartment));

    if (!hasPagination || !pageSize) {
      const totalPages = total > 0 ? 1 : 0;
      return {
        items,
        total,
        page: 1,
        pageSize: items.length,
        totalPages
      };
    }

    const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    return {
      items,
      total,
      page,
      pageSize,
      totalPages
    };
  }

  async getApartmentById(id: string): Promise<IApartment> {
    const dataSource = getDataSource();
    const repository = dataSource.getRepository(Apartment);
    const apartment = await repository.findOne({ where: { id }, relations: ['host'] });

    if (!apartment) {
      throw new NotFoundError('Apartment not found');
    }

    return this.mapApartment(apartment);
  }
}

export const apartmentService = new ApartmentService();
