import 'reflect-metadata';
import apicache from 'apicache';

process.env.JWT_SECRET = 'test-secret';
process.env.NODE_ENV = 'test';
// Disable response caching during tests to avoid background timers keeping Jest alive.
apicache.options({ enabled: false });
