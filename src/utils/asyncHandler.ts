import type { Request, Response, RequestHandler } from 'express';

type AsyncRequestHandler = (req: Request, res: Response) => Promise<unknown>;

export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    void handler(req, res).catch(next);
  };
}
