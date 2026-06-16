import { useEffect, useState } from 'react';
import { walletApi } from '../api/services';
import { Plus, Edit2, Trash2, X, Wallet as WalletIcon } from 'lucide-react';

interface Wallet {
  _id: string;
  name: string;
  balance: number;
  isDefault: boolean;
}

const Wallets = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    balance: '',
    isDefault: false
  });

  const fetchWallets = async () => {
    try {
      const res = await walletApi.getWallets();
      setWallets(res.data || []);
    } catch (error) {
      console.error('Failed to fetch wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleOpenModal = (wallet?: Wallet) => {
    if (wallet) {
      setEditingId(wallet._id);
      setFormData({
        name: wallet.name,
        balance: wallet.balance.toString(),
        isDefault: wallet.isDefault
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', balance: '0', isDefault: false });
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
        name: formData.name,
        balance: Number(formData.balance),
        isDefault: formData.isDefault
      };

      if (editingId) {
        await walletApi.updateWallet(editingId, payload);
      } else {
        await walletApi.createWallet(payload);
      }
      fetchWallets();
      handleCloseModal();
    } catch (error) {
      console.error('Failed to save wallet:', error);
      alert('Có lỗi xảy ra khi lưu ví');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ví này? Lưu ý: Không thể xóa ví đang chứa giao dịch.')) {
      try {
        await walletApi.deleteWallet(id);
        fetchWallets();
      } catch (error: any) {
        console.error('Failed to delete wallet:', error);
        alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa ví');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (loading) return <div className="flex justify-center items-center h-full text-slate-500">Đang tải dữ liệu...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Ví của tôi</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-indigo-600 text-white px-3 md:px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors shadow-sm font-medium text-sm md:text-base"
        >
          <Plus className="w-5 h-5" />
          <span className="hidden sm:inline">Thêm ví mới</span>
          <span className="sm:hidden">Thêm</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <div key={wallet._id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative overflow-hidden group">
            {wallet.isDefault && (
              <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl tracking-wider uppercase">
                Mặc định
              </div>
            )}
            <div className="flex items-center justify-between mb-4 mt-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <WalletIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-slate-800 text-lg">{wallet.name}</h3>
              </div>
            </div>
            
            <div className="mb-6">
              <p className="text-sm text-slate-500 mb-1 font-medium">Số dư hiện tại</p>
              <p className={`text-2xl font-black ${wallet.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(wallet.balance)}
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-50 pt-4">
              <button
                onClick={() => handleOpenModal(wallet)}
                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors"
                title="Sửa"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(wallet._id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                title="Xóa"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
          <div className="bg-white w-full sm:w-full sm:max-w-md rounded-t-[2rem] sm:rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? 'Sửa ví' : 'Thêm ví mới'}
              </h3>
              <button onClick={handleCloseModal} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Tên ví</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="VD: Tiền mặt, Thẻ tín dụng..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Số dư ban đầu</label>
                <input
                  type="number"
                  required
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  placeholder="0"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                  Đặt làm ví mặc định
                </label>
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

export default Wallets;
