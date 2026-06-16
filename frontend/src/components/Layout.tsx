import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Receipt, LogOut, Wallet, Target, Tags } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', label: 'Tổng quan', icon: <LayoutDashboard className="w-6 h-6 md:w-5 md:h-5" /> },
    { path: '/transactions', label: 'Giao dịch', icon: <Receipt className="w-6 h-6 md:w-5 md:h-5" /> },
    { path: '/wallets', label: 'Ví của tôi', icon: <Wallet className="w-6 h-6 md:w-5 md:h-5" /> },
    { path: '/budgets', label: 'Ngân sách', icon: <Target className="w-6 h-6 md:w-5 md:h-5" /> },
    { path: '/categories', label: 'Danh mục', icon: <Tags className="w-6 h-6 md:w-5 md:h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 shadow-sm flex-col">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-indigo-600 flex items-center gap-2">
            <span className="bg-indigo-100 p-2 rounded-lg text-xl">💰</span>
            Quản Lý Chi Tiêu
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-500'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="mb-4 px-4">
            <p className="text-sm text-slate-400">Xin chào,</p>
            <p className="font-semibold text-slate-700 truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 flex justify-between items-center shadow-sm">
          <h1 className="text-lg font-bold text-indigo-600 flex items-center gap-2">
            <span className="text-xl">💰</span>
            Chi Tiêu
          </h1>
          <button onClick={handleLogout} className="p-2 text-rose-500 bg-rose-50 rounded-full">
            <LogOut className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-slate-200 flex justify-around items-center p-2 pb-safe z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 p-2 min-w-[80px] transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isActive ? 'bg-indigo-50' : ''}`}>
                {item.icon}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
