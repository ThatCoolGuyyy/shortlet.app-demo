import { createServer, Server } from 'http';
import { config, assertRuntimeConfig } from './config';
import { createDataSource, initializeDataSource } from './database';
import { createApp } from './app';

let server: Server | null = null;

async function bootstrap(): Promise<void> {
  if (!server) {
    try {
      assertRuntimeConfig();

      const dataSource = createDataSource();
      await initializeDataSource(dataSource);

      const app = createApp(dataSource);
      server = createServer(app);
      
      server.listen(config.port, () => {
        console.log(`✓ Server running on port ${config.port}`);
      });
      
      server.on('error', (error: any) => {
        console.error('Server error:', error);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }
}

bootstrap();
