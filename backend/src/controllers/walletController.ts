import { Request, Response } from 'express';
import Wallet from '../models/Wallet';
import Transaction from '../models/Transaction';

export const getWallets = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    let wallets = await Wallet.find({ user_id: userId });
    
    if (wallets.length === 0) {
      const defaultWallet = new Wallet({
        user_id: userId,
        name: 'Ví tiền mặt',
        balance: 0,
        isDefault: true
      });
      await defaultWallet.save();
      wallets = [defaultWallet];
    }

    res.json({ status: 'success', data: wallets });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { name, balance, isDefault } = req.body;

    if (isDefault) {
      await Wallet.updateMany({ user_id: userId }, { isDefault: false });
    }

    const newWallet = new Wallet({
      user_id: userId,
      name,
      balance: balance || 0,
      isDefault: isDefault || false
    });

    await newWallet.save();
    res.status(201).json({ status: 'success', data: newWallet });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, balance, isDefault } = req.body;

    const wallet = await Wallet.findOne({ _id: id, user_id: userId });
    if (!wallet) {
      res.status(404).json({ status: 'error', message: 'Wallet not found' });
      return;
    }

    if (isDefault) {
      await Wallet.updateMany({ user_id: userId, _id: { $ne: id } }, { isDefault: false });
    }

    wallet.name = name || wallet.name;
    if (balance !== undefined) wallet.balance = balance;
    if (isDefault !== undefined) wallet.isDefault = isDefault;

    await wallet.save();
    res.json({ status: 'success', data: wallet });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteWallet = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const txCount = await Transaction.countDocuments({ wallet_id: id, user_id: userId });
    if (txCount > 0) {
      res.status(400).json({ status: 'error', message: 'Cannot delete wallet containing transactions' });
      return;
    }

    await Wallet.findOneAndDelete({ _id: id, user_id: userId });
    res.json({ status: 'success', message: 'Wallet deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
