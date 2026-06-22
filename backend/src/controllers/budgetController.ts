import { Request, Response } from 'express';
import Budget from '../models/Budget';
import Transaction from '../models/Transaction';
import mongoose from 'mongoose';

export const getBudgets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query; // 'YYYY-MM'

    const filter: any = { user_id: userId };
    if (typeof month === 'string') {
      filter.month = month;
    }

    const budgets = await Budget.find(filter).populate('category_id', 'name icon color').lean();

    const budgetsWithSpent = await Promise.all(budgets.map(async (budget) => {
      const transactionFilter: any = {
        user_id: new mongoose.Types.ObjectId(userId as string),
        type: 'expense'
      };

      if (budget.category_id) {
        transactionFilter.category_id = new mongoose.Types.ObjectId((budget.category_id as any)._id.toString());
      }

      if (budget.month) {
        const [year, m] = budget.month.split('-');
        const firstDay = new Date(parseInt(year), parseInt(m) - 1, 1);
        const lastDay = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
        transactionFilter.date = { $gte: firstDay, $lte: lastDay };
      }

      const transactions = await Transaction.aggregate([
        { $match: transactionFilter },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const spent = transactions.length > 0 ? transactions[0].total : 0;

      return {
        ...budget,
        spent
      };
    }));

    res.json({ status: 'success', data: budgetsWithSpent });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { category_id, amount, month } = req.body;

    const newBudget = new Budget({
      user_id: userId,
      category_id: category_id || undefined,
      amount,
      month
    });

    await newBudget.save();
    res.status(201).json({ status: 'success', data: newBudget });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ status: 'error', message: 'Budget for this category in this month already exists' });
      return;
    }
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { amount } = req.body;

    const budget = await Budget.findOne({ _id: id, user_id: userId });
    if (!budget) {
      res.status(404).json({ status: 'error', message: 'Budget not found' });
      return;
    }

    if (amount !== undefined) budget.amount = amount;

    await budget.save();
    res.json({ status: 'success', data: budget });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteBudget = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    await Budget.findOneAndDelete({ _id: id, user_id: userId });
    res.json({ status: 'success', message: 'Budget deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
