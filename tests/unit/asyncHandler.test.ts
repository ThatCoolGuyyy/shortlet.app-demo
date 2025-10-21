import type { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../src/utils/asyncHandler';

const createMocks = () => {
  const req = {} as Request;
  const res = {
    json: jest.fn().mockReturnThis(),
    status: jest.fn().mockReturnThis()
  } as unknown as Response;
  const next = jest.fn() as NextFunction;
  return { req, res, next };
};

describe('asyncHandler', () => {
  it('passes resolved responses through without calling next', async () => {
    const { req, res, next } = createMocks();
    const handler = asyncHandler(async (_req, res) => {
      res.status(201).json({ ok: true });
    });

    await handler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ ok: true });
    expect(next).not.toHaveBeenCalled();
  });

  it('forwards thrown errors to next', async () => {
    const { req, res, next } = createMocks();
    const error = new Error('boom');
    const handler = asyncHandler(async () => {
      throw error;
    });

    await handler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
