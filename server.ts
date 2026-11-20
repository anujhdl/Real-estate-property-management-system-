import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer as createViteServer } from 'vite';
import { envConfig } from './backend/config/env.ts';
import inquiryRoutes from './backend/routes/inquiryRoutes.ts';
import uploadRoutes from './backend/routes/uploadRoutes.ts';
import { apiErrorHandler } from './backend/middleware/security.ts';

async function startServer(): Promise<void> {
  const app = express();
  const isProd = envConfig.nodeEnv === 'production';

  app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    })
  );

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Serve uploaded property images
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

  // Backend REST API routes
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/inquiries', inquiryRoutes);
  app.use('/api/uploads', uploadRoutes);

  app.use('/api', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  app.use(apiErrorHandler);

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(envConfig.port, '0.0.0.0', () => {
    console.log(`Aurelia Estates server running on http://0.0.0.0:${envConfig.port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Aurelia Estates server:', err);
  process.exit(1);
});
