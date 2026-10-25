import Transaction from '../models/Transaction.js';
import Budget from '../models/Budget.js';

function selectedPeriod(value) {
  const month = /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '') ? value : new Date().toISOString().slice(0, 7);
  const from = new Date(`${month}-01T00:00:00.000Z`);
  return { month, from, to: new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1)) };
}

export async function getDashboard(req, res, next) {
  try {
    const { month, from, to } = selectedPeriod(req.query.month);
    const [totals, budget] = await Promise.all([
      Transaction.aggregate([{ $match: { userId: req.user._id, date: { $gte: from, $lt: to } } }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
      Budget.findOne({ userId: req.user._id, month }).lean()
    ]);
    const income = totals.find(row => row._id === 'income')?.total || 0;
    const expenses = totals.find(row => row._id === 'expense')?.total || 0;
    const monthlyBudget = budget?.amount ?? null;
    res.json({ month, income, expenses, balance: income - expenses, monthlyBudget, remainingBudget: monthlyBudget === null ? 0 : monthlyBudget - expenses });
  } catch (error) { next(error); }
}

export async function getReports(req, res, next) {
  try {
    const { from, to } = selectedPeriod(req.query.month);
    const [totals, categories, monthly] = await Promise.all([
      Transaction.aggregate([{ $match: { userId: req.user._id, date: { $gte: from, $lt: to } } }, { $group: { _id: '$type', total: { $sum: '$amount' } } }]),
      Transaction.aggregate([{ $match: { userId: req.user._id, type: 'expense', date: { $gte: from, $lt: to } } }, { $group: { _id: '$category', total: { $sum: '$amount' } } }, { $sort: { total: -1 } }]),
      Transaction.aggregate([
        { $match: { userId: req.user._id } },
        { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$date' } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] } },
          expenses: { $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] } } } },
        { $sort: { _id: -1 } }, { $limit: 12 }
      ])
    ]);
    res.json({ income: totals.find(row => row._id === 'income')?.total || 0, expenses: totals.find(row => row._id === 'expense')?.total || 0,
      categories: categories.map(row => ({ category: row._id, amount: row.total })), monthlySpending: monthly.reverse().map(row => ({ month: row._id, income: row.income, expenses: row.expenses })) });
  } catch (error) { next(error); }
}
