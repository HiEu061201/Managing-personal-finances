import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Wallet from '../models/Wallet';
import Category from '../models/Category';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, username, password } = req.body;
    
    // Check if email or username already exists
    const existingUser = await User.findOne({ 
      $or: [
        { email },
        { username: { $exists: true, $ne: null, $eq: username } }
      ]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        res.status(400).json({ status: 'error', message: 'Email already exists' });
      } else {
        res.status(400).json({ status: 'error', message: 'Username already exists' });
      }
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = new User({
      email,
      username: username || undefined,
      passwordHash
    });

    await newUser.save();

    // Create default wallet
    const defaultWallet = new Wallet({
      user_id: newUser._id,
      name: 'Ví tiền mặt',
      balance: 0,
      isDefault: true
    });
    await defaultWallet.save();

    // Create default categories
    const defaultCategories = [
      { user_id: newUser._id, name: 'Ăn uống', type: 'expense', color: '#ef4444', icon: '🍔' },
      { user_id: newUser._id, name: 'Di chuyển', type: 'expense', color: '#f59e0b', icon: '🚗' },
      { user_id: newUser._id, name: 'Mua sắm', type: 'expense', color: '#ec4899', icon: '🛍️' },
      { user_id: newUser._id, name: 'Hóa đơn', type: 'expense', color: '#8b5cf6', icon: '📄' },
      { user_id: newUser._id, name: 'Lương', type: 'income', color: '#10b981', icon: '💰' },
      { user_id: newUser._id, name: 'Đầu tư', type: 'income', color: '#3b82f6', icon: '📈' },
    ];
    await Category.insertMany(defaultCategories as any);

    res.status(201).json({ status: 'success', message: 'User registered successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password } = req.body; // identifier can be email or username

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    
    if (!user) {
      res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ status: 'error', message: 'Invalid credentials' });
      return;
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET environment variable is not defined');
    }

    const token = jwt.sign({ userId: user._id }, jwtSecret, { expiresIn: '1d' });

    res.json({
      status: 'success',
      data: {
        token,
        user: { id: user._id, email: user.email, username: user.username }
      }
    });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
