import express from 'express';
import cors from 'cors';
import { sessionRouter } from './routes/session';
import { db } from './db';

const app = express();
const PORT = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'session-service' });
});

// Routes
app.use('/internal', sessionRouter);

// Initialize database and start server
async function start() {
  try {
    await db.initialize();
    app.listen(PORT);
  } catch (error) {
    console.error('Failed to start session service:', error);
    process.exit(1);
  }
}

start();

