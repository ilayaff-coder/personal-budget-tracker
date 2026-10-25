import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  month: { type: String, required: true, match: /^\d{4}-\d{2}$/ },
  year: { type: Number, required: true, min: 2000, max: 9999 },
  amount: { type: Number, required: true, min: 0.01 }
}, { timestamps: true });
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
