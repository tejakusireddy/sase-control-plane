import express from 'express';
import cors from 'cors';
import { policyRouter } from './routes/policy';
import { db } from './db';
import { seedPolicies } from './scripts/seed';

const app = express();
const PORT = process.env.PORT || 4002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'policy-service' });
});

// Routes
app.use('/internal/orgs', policyRouter);

// Initialize database and start server
async function start() {
  try {
    await db.initialize();
    await seedPolicies();
    app.listen(PORT);
  } catch (error) {
    console.error('Failed to start policy service:', error);
    process.exit(1);
  }
}

start();

