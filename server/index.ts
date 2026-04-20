import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import { initDB } from './db.js';
import { errorHandler } from './middleware/errorHandler.js';
import turfsRouter from './routes/turfs.js';
import matchesRouter from './routes/matches.js';
import bookingsRouter from './routes/bookings.js';
import messagesRouter from './routes/messages.js';
import usersRouter from './routes/users.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const isProd = process.env.NODE_ENV === 'production';

// ─── Middleware ───────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: isProd ? undefined : false, // disable CSP in dev so Vite HMR works
  }),
);
app.use(compression());
app.use(cors());
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────
app.use('/api/turfs', turfsRouter);
app.use('/api/matches', matchesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/messages', messagesRouter);
app.use('/api/users', usersRouter);

// ─── Health check ────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Production & Development Fallbacks ────────────────────────
if (isProd) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));

  // SPA fallback — all non-API routes serve index.html
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Friendly message for development mode if user navigates to port 3001
  app.get('/', (_req, res) => {
    res.send(`
      <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 40px auto; text-align: center;">
        <h1 style="color: #3b82f6;">Sportsy Backend is Running! 🚀</h1>
        <p style="font-size: 18px; color: #4b5563;">You have opened the Express API server.</p>
        <div style="margin-top: 30px; padding: 20px; background: #f3f4f6; border-radius: 8px;">
          <p style="font-weight: bold; margin-bottom: 10px;">To view the actual website, open the Vite frontend:</p>
          <a href="http://localhost:5173" style="font-size: 20px; color: #2563eb; text-decoration: none; font-weight: bold;">Go to Frontend (http://localhost:5173)</a>
          <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">(Check your terminal if Vite is using a different port like 5174 or 5175)</p>
        </div>
      </div>
    `);
  });
}

// ─── Error handler (must be last) ────────────────────────────
app.use(errorHandler);

// ─── Start ───────────────────────────────────────────────────
async function start() {
  try {
    await initDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`   Mode: ${isProd ? 'production' : 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
