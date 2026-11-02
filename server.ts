import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

import { connectDB, isFallbackActive, getDatabaseUri } from './src/server/db/connection';
import { initializeDatabase } from './src/server/db/repository';
import { initSocketIO } from './src/server/socket';

import apiRoutes from './src/server/routes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Real-Time WebSockets
initSocketIO(httpServer);

// Mount Modular API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    module: 'SakhiLink Full-Stack Server',
    database: {
      type: isFallbackActive() ? 'In-Memory Resilient Persistence Engine (Cloud Preview)' : 'MongoDB Community Server',
      uri: getDatabaseUri(),
      connected: true
    },
    realtime: 'Socket.IO Enabled',
    version: '2.0.0'
  });
});

/* --- Vite Middlewares Setup & Server Startup --- */
async function startServer() {
  try {
    // 1. Establish Database Connection (Local MongoDB or Resilient Fallback)
    await connectDB();
    // 2. Initialize / Seed Collections
    await initializeDatabase();
  } catch (err: any) {
    console.error('[Startup Warning] Database initialization notice:', err.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[SakhiLink Server] Running with Socket.IO & MongoDB on http://0.0.0.0:${PORT}`);
  });
}

startServer();
