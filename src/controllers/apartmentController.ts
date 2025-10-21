import type { Request, Response } from 'express';
import { CreateApartmentDto, ListApartmentsDto } from '../dto/ApartmentDto';
import { CreateBookingDto } from '../dto/BookingDto';
import { apartmentService } from '../services/apartmentService';
import { bookingService } from '../services/bookingService';
import { validateDto } from '../utils/validation';

class ApartmentController {
  createApartment = async (req: Request, res: Response): Promise<void> => {
    const payload = await validateDto(CreateApartmentDto, req.body);
    const apartment = await apartmentService.createApartment(payload, req.user!.sub);
    res.status(201).json(apartment);
  };

  listApartments = async (req: Request, res: Response): Promise<void> => {
    const filters = await validateDto(ListApartmentsDto, req.query);
    const apartments = await apartmentService.listApartments(filters);
    res.json(apartments);
  };

  getApartment = async (req: Request, res: Response): Promise<void> => {
    const apartment = await apartmentService.getApartmentById(req.params.apartmentId);
    res.json(apartment);
  };

  createBooking = async (req: Request, res: Response): Promise<void> => {
    const payload = await validateDto(CreateBookingDto, req.body);
    const booking = await bookingService.createBooking(req.params.apartmentId, req.user!.sub, payload);
    res.status(201).json(booking);
  };

  listBookings = async (req: Request, res: Response): Promise<void> => {
    const bookings = await bookingService.listBookingsForApartment(req.params.apartmentId);
    res.json(bookings);
  };
}

export const apartmentController = new ApartmentController();
