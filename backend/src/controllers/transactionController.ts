import { Request, Response } from 'express';
import Transaction from '../models/Transaction';
import Wallet from '../models/Wallet';
import mongoose from 'mongoose';

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const transactions = await Transaction.find({ user_id: userId })
      .populate('wallet_id', 'name')
      .populate('category_id', 'name icon color')
      .sort({ date: -1 });
    res.json({ status: 'success', data: transactions });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { wallet_id, category_id, type, amount, date, category, note } = req.body;

    const wallet = await Wallet.findOne({ _id: wallet_id, user_id: userId });
    if (!wallet) {
      res.status(404).json({ status: 'error', message: 'Wallet not found' });
      return;
    }

    const transaction = new Transaction({
      user_id: userId,
      wallet_id,
      category_id,
      type,
      amount,
      date,
      category,
      note
    });

    await transaction.save();

    // Update wallet balance
    if (type === 'income') {
      wallet.balance += amount;
    } else {
      wallet.balance -= amount;
    }
    await wallet.save();

    res.status(201).json({ status: 'success', data: transaction });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const updates = req.body;

    const oldTransaction = await Transaction.findOne({ _id: id, user_id: userId });
    if (!oldTransaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }

    // Revert old transaction effect on old wallet
    const oldWallet = await Wallet.findOne({ _id: oldTransaction.wallet_id, user_id: userId });
    if (oldWallet) {
      if (oldTransaction.type === 'income') {
        oldWallet.balance -= oldTransaction.amount;
      } else {
        oldWallet.balance += oldTransaction.amount;
      }
      await oldWallet.save();
    }

    // Apply updates safely (prevent mass assignment)
    const allowedUpdates = ['amount', 'category_id', 'type', 'date', 'note', 'wallet_id', 'category'];
    allowedUpdates.forEach(field => {
      if (updates[field] !== undefined) {
        (oldTransaction as any)[field] = updates[field];
      }
    });
    await oldTransaction.save();

    // Apply new transaction effect on new wallet
    const newWallet = await Wallet.findOne({ _id: oldTransaction.wallet_id, user_id: userId });
    if (newWallet) {
      if (oldTransaction.type === 'income') {
        newWallet.balance += oldTransaction.amount;
      } else {
        newWallet.balance -= oldTransaction.amount;
      }
      await newWallet.save();
    }

    res.json({ status: 'success', data: oldTransaction });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteTransaction = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const transaction = await Transaction.findOneAndDelete({ _id: id, user_id: userId });

    if (!transaction) {
      res.status(404).json({ status: 'error', message: 'Transaction not found' });
      return;
    }

    // Revert wallet balance
    const wallet = await Wallet.findOne({ _id: transaction.wallet_id, user_id: userId });
    if (wallet) {
      if (transaction.type === 'income') {
        wallet.balance -= transaction.amount;
      } else {
        wallet.balance += transaction.amount;
      }
      await wallet.save();
    }

    res.json({ status: 'success', message: 'Transaction deleted' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId((req as any).userId);
    const { month } = req.query; // 'YYYY-MM' format

    let firstDay, lastDay;
    if (month && typeof month === 'string') {
      const [year, m] = month.split('-');
      firstDay = new Date(parseInt(year), parseInt(m) - 1, 1);
      lastDay = new Date(parseInt(year), parseInt(m), 0, 23, 59, 59);
    } else {
      // Default to all time if no month specified for dashboard? Or current month?
      // Spec says "Dashboard thêm UI chọn khoảng thời gian". Usually default is current month.
      const date = new Date();
      firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
      lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    }

    const stats = await Transaction.aggregate([
      { 
        $match: { 
          user_id: userId,
          date: { $gte: firstDay, $lte: lastDay }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    let income = 0;
    let expense = 0;

    stats.forEach(stat => {
      if (stat._id === 'income') income = stat.total;
      if (stat._id === 'expense') expense = stat.total;
    });

    const wallets = await Wallet.find({ user_id: userId });
    const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

    res.json({ 
      status: 'success', 
      data: {
        income,
        expense,
        balance: totalBalance,
        wallets
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
