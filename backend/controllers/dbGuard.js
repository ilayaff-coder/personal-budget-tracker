import mongoose from 'mongoose';

export function requireDatabase(_req, res, next) {
  if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is disconnected. Check MONGO_URI and ensure the database is running.' });
  next();
}
