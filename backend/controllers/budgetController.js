import mongoose from 'mongoose';
import Budget from '../models/Budget.js';

const validPeriod = month => typeof month === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(month);
const validAmount = amount => Number.isFinite(Number(amount)) && Number(amount) > 0;

export async function listBudgets(req, res, next) {
  try { res.json(await Budget.find({ userId: req.user._id }).sort({ year: -1, month: -1 })); } catch (error) { next(error); }
}
export async function getBudget(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid budget id.' });
    const item = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    return item ? res.json(item) : res.status(404).json({ message: 'Budget not found.' });
  } catch (error) { next(error); }
}
export async function createBudget(req, res, next) {
  try {
    const { month, amount } = req.body;
    if (!validPeriod(month) || !validAmount(amount)) return res.status(400).json({ message: 'Provide a valid YYYY-MM month and positive amount.' });
    const [year] = month.split('-').map(Number);
    const item = await Budget.findOneAndUpdate({ userId: req.user._id, month }, { userId: req.user._id, month, year, amount: Number(amount) }, { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.status(201).json(item);
  } catch (error) { next(error); }
}
export async function updateBudget(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid budget id.' });
    const current = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!current) return res.status(404).json({ message: 'Budget not found.' });
    const month = req.body.month ?? current.month;
    const amount = req.body.amount ?? current.amount;
    if (!validPeriod(month) || !validAmount(amount)) return res.status(400).json({ message: 'Provide a valid YYYY-MM month and positive amount.' });
    const [year] = month.split('-').map(Number);
    const item = await Budget.findOneAndUpdate({ _id: req.params.id, userId: req.user._id }, { month, year, amount: Number(amount) }, { new: true, runValidators: true });
    res.json(item);
  } catch (error) { next(error); }
}
export async function deleteBudget(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid budget id.' });
    const item = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    return item ? res.json({ message: 'Budget deleted.' }) : res.status(404).json({ message: 'Budget not found.' });
  } catch (error) { next(error); }
}
