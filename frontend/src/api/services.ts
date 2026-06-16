import axios from './axios';

export const walletApi = {
  getWallets: () => axios.get('/wallets'),
  createWallet: (data: any) => axios.post('/wallets', data),
  updateWallet: (id: string, data: any) => axios.put(`/wallets/${id}`, data),
  deleteWallet: (id: string) => axios.delete(`/wallets/${id}`)
};

export const categoryApi = {
  getCategories: () => axios.get('/categories'),
  createCategory: (data: any) => axios.post('/categories', data),
  updateCategory: (id: string, data: any) => axios.put(`/categories/${id}`, data),
  deleteCategory: (id: string) => axios.delete(`/categories/${id}`)
};

export const budgetApi = {
  getBudgets: (month?: string) => axios.get('/budgets', { params: { month } }),
  createBudget: (data: any) => axios.post('/budgets', data),
  updateBudget: (id: string, data: any) => axios.put(`/budgets/${id}`, data),
  deleteBudget: (id: string) => axios.delete(`/budgets/${id}`)
};
