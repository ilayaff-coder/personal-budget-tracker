import mongoose from 'mongoose';
import Transaction from '../models/Transaction.js';

const validId = id => mongoose.isValidObjectId(id);
const validTransaction = ({ type, amount, category, date }) => ['income', 'expense'].includes(type) && Number.isFinite(Number(amount)) && Number(amount) > 0 && typeof category === 'string' && category.trim().length > 0 && !Number.isNaN(new Date(date).getTime());

export async function listTransactions(req, res, next) {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.month && /^\d{4}-\d{2}$/.test(req.query.month)) {
      const start = new Date(`${req.query.month}-01T00:00:00.000Z`);
      filter.date = { $gte: start, $lt: new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 1)) };
    }
    if (req.query.search) {
      const search = String(req.query.search).slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = ['description', 'category', 'type'].map(field => ({ [field]: { $regex: search, $options: 'i' } }));
    }
    filter.userId = req.user._id;
    res.json(await Transaction.find(filter).sort({ date: -1 }));
  } catch (error) { next(error); }
}

export async function getTransaction(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id.' });
    const item = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    return item ? res.json(item) : res.status(404).json({ message: 'Transaction not found.' });
  } catch (error) { next(error); }
}

export async function createTransaction(req, res, next) {
  try {
    if (!validTransaction(req.body)) return res.status(400).json({ message: 'Provide a valid type, positive amount, category and date.' });
    const item = await Transaction.create({ ...req.body, userId: req.user._id, amount: Number(req.body.amount), category: req.body.category.trim() });
    res.status(201).json(item);
  } catch (error) { next(error); }
}

export async function updateTransaction(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id.' });
    const current = await Transaction.findOne({ _id: req.params.id, userId: req.user._id });
    if (!current) return res.status(404).json({ message: 'Transaction not found.' });
    const candidate = { ...current.toObject(), ...req.body };
    if (!validTransaction(candidate)) return res.status(400).json({ message: 'Provide a valid type, positive amount, category and date.' });
    const updates = {
      type: candidate.type,
      amount: Number(candidate.amount),
      category: candidate.category.trim(),
      description: String(candidate.description || '').trim(),
      date: candidate.date
    };
    const item = await Transaction.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, updates, { new: true, runValidators: true });
    res.json(item);
  } catch (error) { next(error); }
}

export async function deleteTransaction(req, res, next) {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid transaction id.' });
    const item = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return item ? res.json({ message: 'Transaction deleted.' }) : res.status(404).json({ message: 'Transaction not found.' });
  } catch (error) { next(error); }
}
