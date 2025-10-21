import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import apicache from 'apicache';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/requireRole';
import { apartmentController } from '../controllers/apartmentController';
import { asyncHandler } from '../utils/asyncHandler';

// Throttle apartment searches per client IP to guard against bulk scrapers.
const listRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

// Cache identical list responses briefly to avoid hammering the database on repeated filters.
const cacheApartments = apicache.middleware('30 seconds');

export function createApartmentRouter(): Router {
  const router = Router();

  router.post(
    '/',
    authenticate,
    requireRole('host'),
    asyncHandler(apartmentController.createApartment)
  );

  router.get(
    '/',
    listRateLimiter,
    cacheApartments,
    asyncHandler(apartmentController.listApartments)
  );

  router.get('/:apartmentId', asyncHandler(apartmentController.getApartment));

  router.post(
    '/:apartmentId/bookings',
    authenticate,
    requireRole('guest', 'host'),
    asyncHandler(apartmentController.createBooking)
  );

  router.get(
    '/:apartmentId/bookings',
    authenticate,
    asyncHandler(apartmentController.listBookings)
  );

  return router;
}
