declare module 'apicache' {
  import type { RequestHandler } from 'express';

  interface ApiCacheInstance {
    middleware(duration: string | number, ...args: unknown[]): RequestHandler;
    options(options: unknown): ApiCacheInstance;
    clear(target?: string): ApiCacheInstance;
  }

  const apicache: ApiCacheInstance;
  export default apicache;
}
