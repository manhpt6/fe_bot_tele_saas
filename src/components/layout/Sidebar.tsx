import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useGetMeQuery } from '../../api/userApi';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  FolderTree,
  Radio,
  UserCog,
  UserCircle,
  Warehouse,
  Users,
  Receipt,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Ticket,
  Zap,
  TrendingUp,
  Store,
  Layers,
  Globe,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SubNavItem {
  path: string;
  label: string;
  icon: any;
}

interface NavItem {
  path?: string;
  label: string;
  icon: any;
  children?: SubNavItem[];
  roles?: string[];
}

const navItems: NavItem[] = [
  // Super Admin Zone
  { path: '/saas/revenue', label: 'Doanh Thu SaaS', icon: TrendingUp, roles: ['SUPER_ADMIN'] },
  { path: '/saas/tenants', label: 'Quản Lý Shops', icon: Store, roles: ['SUPER_ADMIN'] },
  { path: '/saas/plans', label: 'Gói Cước SaaS', icon: Layers, roles: ['SUPER_ADMIN'] },
  { path: '/saas/platform-settings', label: 'Cấu Hình Sàn', icon: Globe, roles: ['SUPER_ADMIN'] },

  // Tenant Zone
  { path: '/dashboard', label: 'Dashboard Shop', icon: LayoutDashboard, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/subscription', label: 'Gói Cước & Gia Hạn', icon: Zap, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/categories', label: 'Danh mục', icon: FolderTree, roles: ['TENANT_ADMIN', 'TENANT_STAFF', 'ADMIN', 'STAFF'] },
  { path: '/products', label: 'Sản phẩm', icon: Package, roles: ['TENANT_ADMIN', 'TENANT_STAFF', 'ADMIN', 'STAFF'] },
  { path: '/accounts', label: 'Nhập kho', icon: Warehouse, roles: ['TENANT_ADMIN', 'TENANT_STAFF', 'ADMIN', 'STAFF'] },
  {
    label: 'Đơn hàng & Giao dịch',
    icon: ShoppingCart,
    roles: ['TENANT_ADMIN', 'TENANT_STAFF', 'ADMIN', 'STAFF'],
    children: [
      { path: '/orders', label: 'Danh sách đơn hàng', icon: ClipboardList },
      { path: '/payment-events', label: 'Giao dịch chuyển khoản', icon: Receipt },
    ],
  },
  { path: '/customers', label: 'Khách hàng', icon: Users, roles: ['TENANT_ADMIN', 'TENANT_STAFF', 'ADMIN', 'STAFF'] },
  { path: '/vouchers', label: 'Mã giảm giá', icon: Ticket, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/broadcast', label: 'Phát sóng', icon: Radio, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/settings', label: 'Cấu hình Bot & Shop', icon: Settings, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/admins', label: 'Nhân viên Shop', icon: UserCog, roles: ['TENANT_ADMIN', 'ADMIN'] },
  { path: '/profile', label: 'Hồ sơ cá nhân', icon: UserCircle },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: meData } = useGetMeQuery();
  const currentUser = meData || authUser;

  const isOrderPathActive =
    location.pathname.startsWith('/orders') || location.pathname.startsWith('/payment-events');

  const [isOrderMenuOpen, setIsOrderMenuOpen] = useState<boolean>(isOrderPathActive);

  useEffect(() => {
    if (isOrderPathActive) {
      setIsOrderMenuOpen(true);
    }
  }, [isOrderPathActive]);

  return (
    <aside
      className={`w-64 h-screen glass border-r flex flex-col fixed left-0 top-0 z-40 transition-transform duration-300 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center">
        <div>
          <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            BotSaaS Platform
          </h1>
          {currentUser?.role === 'SUPER_ADMIN' ? (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              Super Admin
            </span>
          ) : (
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              Chủ Shop
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onClose?.()}
          className="lg:hidden p-1 text-gray-400 hover:text-white rounded-md hover:bg-slate-800 transition-colors"
          title="Đóng menu"
        >
          <X size={20} />
        </button>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          if (item.roles && (!currentUser || !item.roles.includes(currentUser.role))) {
            return null;
          }

          const Icon = item.icon;

          if (item.children) {
            const hasActiveChild = item.children.some((child) => location.pathname.startsWith(child.path));

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                    hasActiveChild
                      ? 'bg-blue-600/10 text-blue-400 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={20} className={hasActiveChild ? 'text-blue-400' : 'text-gray-400'} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {isOrderMenuOpen ? (
                    <ChevronDown size={16} className="text-gray-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight size={16} className="text-gray-400 transition-transform duration-200" />
                  )}
                </button>

                {isOrderMenuOpen && (
                  <div className="pl-6 pr-2 py-1 space-y-1 border-l-2 border-slate-800 ml-4 animate-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname.startsWith(child.path);

                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => onClose?.()}
                          className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isChildActive
                              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                          }`}
                        >
                          <ChildIcon size={15} />
                          <span>{child.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = location.pathname.startsWith(item.path!);
          return (
            <Link
              key={item.path}
              to={item.path!}
              onClick={() => onClose?.()}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
