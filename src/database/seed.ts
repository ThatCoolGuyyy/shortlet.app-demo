import bcrypt from 'bcryptjs';
import type { DataSource } from 'typeorm';
import { Apartment } from './entities/Apartment';
import { Booking } from './entities/Booking';
import { User } from './entities/User';

async function ensureUser(
  dataSource: DataSource,
  userDetails: { name: string; email: string; role: 'host' | 'guest' }
): Promise<User> {
  const repository = dataSource.getRepository(User);
  const existing = await repository.findOne({ where: { email: userDetails.email } });
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash('password123', 10);
  const user = repository.create({ ...userDetails, passwordHash });
  return repository.save(user);
}

async function ensureApartments(dataSource: DataSource, host: User): Promise<Apartment[]> {
  const repository = dataSource.getRepository(Apartment);
  const apartments: Apartment[] = [];

  const apartmentData = [
    {
      title: 'Cozy Downtown Loft',
      description: 'Bright loft apartment close to restaurants and transit.',
      location: 'Lagos',
      pricePerNight: 180,
      amenities: ['wifi', 'air conditioning', 'workspace']
    },
    {
      title: 'Luxury Waterfront Villa',
      description: 'Stunning beachfront villa with private pool and ocean views.',
      location: 'Victoria Island',
      pricePerNight: 450,
      amenities: ['pool', 'ocean view', 'wifi', 'gym', 'concierge']
    },
    {
      title: 'Modern Apartment with Balcony',
      description: 'Contemporary 2-bedroom apartment in the heart of the city.',
      location: 'Ikoyi',
      pricePerNight: 280,
      amenities: ['balcony', 'wifi', 'air conditioning', 'laundry']
    },
    {
      title: 'Charming Colonial House',
      description: 'Historic house with vintage charm and modern amenities.',
      location: 'Lekki',
      pricePerNight: 220,
      amenities: ['garden', 'wifi', 'fireplace', 'kitchen']
    },
    {
      title: 'Spacious Family Townhouse',
      description: '3-bedroom townhouse perfect for families or group stays.',
      location: 'Ajah',
      pricePerNight: 320,
      amenities: ['parking', 'wifi', 'garden', 'kitchen', 'gaming area']
    },
    {
      title: 'Studio Near Business District',
      description: 'Compact studio apartment ideal for business travelers.',
      location: 'Ikoyi',
      pricePerNight: 150,
      amenities: ['wifi', 'workspace', 'air conditioning', 'near transit']
    },
    {
      title: 'Boutique Penthouse',
      description: 'Exclusive penthouse with panoramic city views and rooftop access.',
      location: 'Lagos Island',
      pricePerNight: 550,
      amenities: ['rooftop', 'city view', 'wifi', 'premium kitchen', 'home theater']
    },
    {
      title: 'Artistic Loft in Creative Zone',
      description: 'Artist-friendly loft with high ceilings and natural light.',
      location: 'Yaba',
      pricePerNight: 200,
      amenities: ['high ceilings', 'natural light', 'wifi', 'workspace']
    }
  ];

  for (const data of apartmentData) {
    const existing = await repository.findOne({ where: { title: data.title } });
    if (existing) {
      apartments.push(existing);
    } else {
      const apartment = repository.create({ ...data, host });
      const saved = await repository.save(apartment);
      apartments.push(saved);
    }
  }

  return apartments;
}

async function ensureBooking(dataSource: DataSource, apartment: Apartment, guest: User): Promise<void> {
  const repository = dataSource.getRepository(Booking);
  const startDate = '2024-06-10';
  const existing = await repository.findOne({ where: { startDate } });
  if (existing) {
    return;
  }

  const endDate = '2024-06-14';
  const nights = 4;

  const booking = repository.create({
    apartment,
    guest,
    startDate,
    endDate,
    totalPrice: nights * apartment.pricePerNight
  });

  await repository.save(booking);
}

export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const host = await ensureUser(dataSource, {
    name: 'Helena Host',
    email: 'host@example.com',
    role: 'host'
  });

  const guest = await ensureUser(dataSource, {
    name: 'Gary Guest',
    email: 'guest@example.com',
    role: 'guest'
  });

  const apartments = await ensureApartments(dataSource, host);
  
  // Create a booking for the first apartment
  if (apartments.length > 0) {
    await ensureBooking(dataSource, apartments[0], guest);
  }
}
