import { useEffect, useState } from 'react';
import axios from '../api/axios';
import { Wallet, ArrowUpCircle, ArrowDownCircle, Target } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface DashboardStats {
  income: number;
  expense: number;
  balance: number;
  wallets: { _id: string, name: string, balance: number, isDefault: boolean }[];
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const currentDate = new Date();
  const currentMonthStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const [selectedMonth, setSelectedMonth] = useState(currentMonthStr);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/transactions/dashboard', { params: { month: selectedMonth } });
        setStats(res.data || null);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedMonth]);

  if (loading || !stats) return <div className="flex justify-center items-center h-full text-slate-500">Đang tải dữ liệu...</div>;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const pieData = [
    { name: 'Thu nhập', value: stats?.income || 0, color: '#10b981' },
    { name: 'Chi tiêu', value: stats?.expense || 0, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Tổng quan tài chính</h2>
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-100 flex inline-flex items-center w-max">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 bg-transparent outline-none text-slate-700 font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 p-6 rounded-3xl shadow-lg text-white">
          <p className="text-indigo-100 text-sm font-medium mb-1">Tổng số dư</p>
          <p className="text-3xl font-bold text-white">
            {formatCurrency(stats?.balance || 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600"><ArrowUpCircle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng thu</p>
            <p className="text-xl font-bold text-slate-800">+{formatCurrency(stats?.income || 0)}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600"><ArrowDownCircle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng chi</p>
            <p className="text-xl font-bold text-slate-800">-{formatCurrency(stats?.expense || 0)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-500" />
            Tỷ lệ Thu / Chi ({selectedMonth})
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-700 mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-500" />
            Danh sách Ví
          </h3>
          <div className="space-y-4">
            {stats.wallets.map(wallet => (
              <div key={wallet._id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 text-sm">{wallet.name}</h4>
                    {wallet.isDefault && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase font-bold tracking-wider">Mặc định</span>}
                  </div>
                </div>
                <div className={`font-black ${wallet.balance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatCurrency(wallet.balance)}
                </div>
              </div>
            ))}
            {stats.wallets.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-4">Chưa có ví nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
