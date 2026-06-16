import { Request, Response } from 'express';
import Category from '../models/Category';
import Transaction from '../models/Transaction';

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    let categories = await Category.find({ user_id: userId });
    
    if (categories.length === 0) {
      const defaultCategories = [
        { user_id: userId, name: 'Ăn uống', type: 'expense', color: '#ef4444', icon: '🍔' },
        { user_id: userId, name: 'Di chuyển', type: 'expense', color: '#f59e0b', icon: '🚗' },
        { user_id: userId, name: 'Mua sắm', type: 'expense', color: '#ec4899', icon: '🛍️' },
        { user_id: userId, name: 'Hóa đơn', type: 'expense', color: '#8b5cf6', icon: '📄' },
        { user_id: userId, name: 'Lương', type: 'income', color: '#10b981', icon: '💰' },
        { user_id: userId, name: 'Đầu tư', type: 'income', color: '#3b82f6', icon: '📈' },
      ];
      await Category.insertMany(defaultCategories as any);
      categories = await Category.find({ user_id: userId });
    }

    res.json({ status: 'success', data: categories });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { name, type, color, icon } = req.body;

    const newCategory = new Category({
      user_id: userId,
      name,
      type,
      color,
      icon
    });

    await newCategory.save();
    res.status(201).json({ status: 'success', data: newCategory });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;
    const { name, type, color, icon } = req.body;

    const category = await Category.findOne({ _id: id, user_id: userId });
    if (!category) {
      res.status(404).json({ status: 'error', message: 'Category not found' });
      return;
    }

    if (name) category.name = name;
    if (type) category.type = type;
    if (color) category.color = color;
    if (icon) category.icon = icon;

    await category.save();
    res.json({ status: 'success', data: category });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const txCount = await Transaction.countDocuments({ category_id: id, user_id: userId });
    if (txCount > 0) {
      res.status(400).json({ status: 'error', message: 'Cannot delete category containing transactions' });
      return;
    }

    await Category.findOneAndDelete({ _id: id, user_id: userId });
    res.json({ status: 'success', message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};
