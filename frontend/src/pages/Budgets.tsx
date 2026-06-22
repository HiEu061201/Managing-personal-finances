import { useEffect, useState } from 'react';
import { budgetApi, categoryApi } from '../api/services';
import { Plus, Edit2, Trash2, X, Target } from 'lucide-react';

interface Category {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
}

interface Budget {
  _id: string;
  category_id?: Category;
  amount: number;
  month: string;
  spent?: number;
}

const Budgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Mặc định chọn tháng hiện tại
  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);
  
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    month: currentMonthStr
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [budgetsRes, categoriesRes] = await Promise.all([
        budgetApi.getBudgets(selectedMonth),
        categoryApi.getCategories()
      ]);
      setBudgets(budgetsRes.data || []);
      // Chỉ lấy danh mục chi tiêu cho ngân sách
      const categories = categoriesRes.data || [];
      setCategories(categories.filter((c: Category) => c.type === 'expense'));
    } catch (error) {
      console.error('Failed to fetch budgets data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const handleOpenModal = (budget?: Budget) => {
    if (budget) {
      setEditingId(budget._id);
      setFormData({
        category_id: budget.category_id ? budget.category_id._id : '',
        amount: budget.amount.toString(),
        month: budget.month
      });
    } else {
      setEditingId(null);
      setFormData({ category_id: '', amount: '', month: selectedMonth });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        category_id: formData.category_id || null, // null = Ngân sách tổng
        amount: Number(formData.amount),
        month: formData.month
      };

      if (editingId) {
        await budgetApi.updateBudget(editingId, payload);
      } else {
        await budgetApi.createBudget(payload);
      }
      fetchData();
      handleCloseModal();
    } catch (error: any) {
      console.error('Failed to save budget:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi lưu ngân sách');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ngân sách này?')) {
      try {
        await budgetApi.deleteBudget(id);
        fetchData();
      } catch (error: any) {
        console.error('Failed to delete budget:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa ngân sách');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 flex items-center gap-2">
          <Target className="w-6 h-6 text-indigo-600" />
          Ngân sách
        </h2>
        
        <div className="flex gap-2 w-full md:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-700 shadow-sm"
          />
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm md:text-base flex-1 md:flex-none"
          >
            <Plus className="w-5 h-5" />
            <span>Thêm</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-slate-500">Đang tải dữ liệu...</div>
      ) : budgets.length === 0 ? (
        <div className="bg-white p-10 rounded-3xl shadow-sm border border-slate-100 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-2">Chưa có ngân sách nào</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto text-sm">
            Tạo ngân sách giúp bạn kiểm soát chi tiêu tốt hơn. Bạn có thể tạo ngân sách cho từng danh mục hoặc ngân sách tổng.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="bg-indigo-50 text-indigo-600 px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-100 transition-colors inline-block"
          >
            Tạo ngân sách đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {budgets.map((budget) => {
            // Lấy giá trị đã tiêu từ API, nếu không có thì mặc định là 0
            const spent = budget.spent || 0; 
            const percent = Math.min((spent / budget.amount) * 100, 100);
            
            let colorClass = 'bg-emerald-500';
            if (percent > 80) colorClass = 'bg-rose-500';
            else if (percent > 50) colorClass = 'bg-amber-500';

            const catName = budget.category_id ? budget.category_id.name : 'Ngân sách tổng';
            const catIcon = budget.category_id ? budget.category_id.icon : '🌎';
            const catColor = budget.category_id ? budget.category_id.color : '#6366f1';

            return (
              <div key={budget._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner"
                      style={{ backgroundColor: `${catColor}20`, color: catColor }}
                    >
                      {catIcon}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-lg">{catName}</h3>
                      <p className="text-xs text-slate-500 font-medium">{budget.month}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenModal(budget)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(budget._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-2 flex justify-between items-end">
                  <div>
                    <span className="text-sm font-bold text-slate-700">{formatCurrency(spent)}</span>
                    <span className="text-xs text-slate-400 ml-1 font-medium">đã tiêu</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-400">{formatCurrency(budget.amount)}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 mb-2 overflow-hidden">
                  <div className={`${colorClass} h-2.5 rounded-full transition-all duration-1000`} style={{ width: `${percent}%` }}></div>
                </div>

                <p className="text-xs font-medium text-slate-500 text-right">
                  Còn lại: <span className="font-bold text-slate-700">{formatCurrency(budget.amount - spent)}</span>
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Sửa ngân sách' : 'Tạo ngân sách'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tháng áp dụng</label>
                <input
                  type="month"
                  required
                  value={formData.month}
                  onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Danh mục</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                >
                  <option value="">Tất cả danh mục (Ngân sách tổng)</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.icon} {c.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số tiền tối đa</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="VD: 5000000"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:bg-indigo-800 transition-colors shadow-sm"
                >
                  Lưu lại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Budgets;
