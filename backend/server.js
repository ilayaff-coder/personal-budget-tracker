import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import transactionRoutes from './routes/transactionRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import authRoutes from './routes/authRoutes.js';
import { getDashboard, getReports } from './controllers/summaryController.js';
import { requireDatabase } from './controllers/dbGuard.js';
import { requireAuth } from './controllers/requireAuth.js';

const app = express();
const clientUrl = process.env.CLIENT_URL
  ? (/^https?:\/\//i.test(process.env.CLIENT_URL) ? process.env.CLIENT_URL : `https://${process.env.CLIENT_URL}`)
  : 'http://localhost:5173';
app.use(cors({ origin: clientUrl }));
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.get('/api/dashboard', requireDatabase, requireAuth, getDashboard);
app.get('/api/reports', requireDatabase, requireAuth, getReports);

app.use((err, _req, res, _next) => {
  console.error(err);
  if (err.name === 'ValidationError' || err.name === 'CastError') return res.status(400).json({ message: err.message });
  if (err.code === 11000) return res.status(409).json({ message: 'A budget for that month already exists.' });
  res.status(500).json({ message: 'A server error occurred.' });
});

const port = process.env.PORT || 5000;
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch(error => console.error(`MongoDB connection failed: ${error.message}`));
} else {
  console.error('MongoDB connection failed: set MONGO_URI in backend/.env');
}
if (!process.env.JWT_SECRET) console.error('Authentication disabled until JWT_SECRET is set in backend/.env');
app.listen(port, () => console.log(`Budget API running at http://localhost:${port}`));
