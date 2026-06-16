import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { walletApi, categoryApi } from '../api/services';
import { Plus, Edit2, Trash2, X, TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface WalletType {
  _id: string;
  name: string;
}

interface CategoryType {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Transaction {
  _id: string;
  wallet_id: WalletType;
  category_id?: CategoryType;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  category: string; // Tên fallback
  note?: string;
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wallets, setWallets] = useState<WalletType[]>([]);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // States cho filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const [formData, setFormData] = useState({
    wallet_id: '',
    type: 'expense',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    note: ''
  });

  const fetchData = async () => {
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        axios.get('/transactions'),
        walletApi.getWallets(),
        categoryApi.getCategories()
      ]);
      setTransactions(txRes.data || []);
      setWallets(walletRes.data || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (transaction?: Transaction) => {
    if (transaction) {
      setEditingId(transaction._id);
      setFormData({
        wallet_id: transaction.wallet_id._id,
        type: transaction.type,
        amount: transaction.amount.toString(),
        date: new Date(transaction.date).toISOString().split('T')[0],
        category_id: transaction.category_id ? transaction.category_id._id : '',
        note: transaction.note || ''
      });
    } else {
      setEditingId(null);
      const defaultWallet = wallets.find((w: any) => w.isDefault) || wallets[0];
      const defaultCat = categories.find(c => c.type === 'expense');
      setFormData({
        wallet_id: defaultWallet ? defaultWallet._id : '',
        type: 'expense',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category_id: defaultCat ? defaultCat._id : '',
        note: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleTypeChange = (newType: 'income' | 'expense') => {
    const defaultCat = categories.find(c => c.type === newType);
    setFormData({
      ...formData,
      type: newType,
      category_id: defaultCat ? defaultCat._id : ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedCat = categories.find(c => c._id === formData.category_id);
      
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        category: selectedCat ? selectedCat.name : '' // fallback
      };

      if (editingId) {
        await axios.put(`/transactions/${editingId}`, payload);
      } else {
        await axios.post('/transactions', payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error('Failed to save transaction', error);
      alert('Có lỗi xảy ra khi lưu giao dịch');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa giao dịch này?')) {
      try {
        await axios.delete(`/transactions/${id}`);
        fetchData();
      } catch (error) {
        console.error('Failed to delete transaction', error);
        alert('Có lỗi xảy ra khi xóa giao dịch');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const filteredTransactions = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const catName = tx.category_id ? tx.category_id.name.toLowerCase() : tx.category.toLowerCase();
      const walletName = tx.wallet_id ? tx.wallet_id.name.toLowerCase() : '';
      const matchNote = tx.note?.toLowerCase().includes(term) || false;
      if (!catName.includes(term) && !walletName.includes(term) && !matchNote) return false;
    }
    if (minAmount && tx.amount < Number(minAmount)) return false;
    if (maxAmount && tx.amount > Number(maxAmount)) return false;
    return true;
  });

  const activeCategories = categories.filter(c => c.type === formData.type);

  if (loading) return <div className="flex justify-center items-center h-full text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Giao dịch</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-slate-100 text-slate-600 px-3 md:px-4 py-2 rounded-xl hover:bg-slate-200 transition-colors shadow-sm font-medium text-sm md:text-base"
          >
            <span className="hidden sm:inline">Bộ lọc</span>
            <span className="sm:hidden">Lọc</span>
          </button>
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm md:text-base"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Thêm giao dịch</span>
            <span className="sm:hidden">Thêm</span>
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Tìm kiếm</label>
              <input
                type="text"
                placeholder="Ghi chú, ví, danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Loại</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none"
              >
                <option value="all">Tất cả</option>
                <option value="income">Thu nhập</option>
                <option value="expense">Chi tiêu</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Từ số tiền</label>
              <input
                type="number"
                placeholder="0 đ"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Đến số tiền</label>
              <input
                type="number"
                placeholder="Vô hạn"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
            </div>
          </div>
          {(searchTerm || filterType !== 'all' || minAmount || maxAmount) && (
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setMinAmount('');
                  setMaxAmount('');
                }}
                className="text-xs font-semibold text-rose-500 hover:text-rose-600 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors"
              >
                Xóa bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Mobile Cards View */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">Không tìm thấy giao dịch nào</div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx._id} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ 
                      backgroundColor: tx.category_id ? `${tx.category_id.color}20` : '#f1f5f9',
                      color: tx.category_id ? tx.category_id.color : '#64748b' 
                    }}
                  >
                    {tx.category_id ? tx.category_id.icon : (tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">{tx.category_id ? tx.category_id.name : tx.category}</h4>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                      <span className="font-semibold text-slate-600">{tx.wallet_id?.name}</span> • {tx.note || new Date(tx.date).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                  </span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleOpenModal(tx)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(tx._id)} className="text-slate-400 hover:text-rose-600 transition-colors p-1">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">Ngày</th>
                <th className="p-4 font-semibold">Ví</th>
                <th className="p-4 font-semibold">Danh mục</th>
                <th className="p-4 font-semibold">Ghi chú</th>
                <th className="p-4 font-semibold text-right">Số tiền</th>
                <th className="p-4 font-semibold text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-slate-500">
                    Không tìm thấy giao dịch nào phù hợp với bộ lọc
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 text-slate-600 text-sm font-medium">
                      {new Date(tx.date).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Wallet className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-700 font-medium">{tx.wallet_id?.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {tx.category_id && (
                          <span 
                            className="w-6 h-6 rounded flex items-center justify-center text-sm"
                            style={{ backgroundColor: `${tx.category_id.color}20` }}
                          >
                            {tx.category_id.icon}
                          </span>
                        )}
                        <span className="text-slate-800 font-bold">{tx.category_id ? tx.category_id.name : tx.category}</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm max-w-[200px] truncate" title={tx.note}>{tx.note}</td>
                    <td className={`p-4 text-right font-bold tracking-tight ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(tx)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Sửa"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full sm:rounded-3xl shadow-2xl max-w-md overflow-hidden rounded-t-3xl animate-in slide-in-from-bottom-full md:slide-in-from-bottom-10 duration-300">
            <div className="flex justify-between items-center p-5 md:p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Sửa giao dịch' : 'Thêm giao dịch mới'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="expense"
                    checked={formData.type === 'expense'}
                    onChange={() => handleTypeChange('expense')}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2.5 rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm transition-all">
                    Chi tiêu
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input 
                    type="radio" 
                    name="type" 
                    value="income"
                    checked={formData.type === 'income'}
                    onChange={() => handleTypeChange('income')}
                    className="peer sr-only"
                  />
                  <div className="text-center py-2.5 rounded-lg text-sm font-bold text-slate-500 peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm transition-all">
                    Thu nhập
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số tiền (VNĐ)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₫</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all font-semibold"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ngày</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">Ví nguồn</label>
                  <select
                    required
                    value={formData.wallet_id}
                    onChange={(e) => setFormData({...formData, wallet_id: e.target.value})}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm font-medium text-slate-700 appearance-none"
                  >
                    {wallets.map(w => (
                      <option key={w._id} value={w._id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Danh mục</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto p-1">
                  {activeCategories.map(cat => (
                    <div 
                      key={cat._id}
                      onClick={() => setFormData({...formData, category_id: cat._id})}
                      className={`cursor-pointer border rounded-xl p-2 flex flex-col items-center gap-1 transition-all ${
                        formData.category_id === cat._id 
                          ? 'border-indigo-500 bg-indigo-50 shadow-sm' 
                          : 'border-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-xl">{cat.icon}</span>
                      <span className="text-[10px] font-bold text-slate-600 text-center line-clamp-1">{cat.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ghi chú</label>
                <input
                  type="text"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-sm"
                  placeholder="Nhập ghi chú tùy chọn..."
                />
              </div>

              <div className="pt-2 flex gap-3 pb-safe">
                <button
                  type="submit"
                  className="w-full px-4 py-3.5 text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98]"
                >
                  {editingId ? 'Cập nhật' : 'Lưu giao dịch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
