import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth';
import { db } from './db';
import { seedDatabase } from './scripts/seed';

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth-service' });
});

// Routes
app.use('/internal/auth', authRouter);

// Initialize database and start server
async function start() {
  try {
    await db.initialize();
    await seedDatabase();
    app.listen(PORT);
  } catch (error) {
    console.error('Failed to start auth service:', error);
    process.exit(1);
  }
}

start();

