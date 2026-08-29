import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store/store';
import { setLockedFeatureKey } from '../../store/authSlice';
import { useGetMeQuery } from '../../api/userApi';
import { useSimulation } from '../../context/SimulationContext';
import { useFeatureGuard } from '../../hooks/use-feature-guard';
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
  Gamepad2,
  Gem,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface SubNavItem {
  path: string;
  label: string;
  icon: any;
  featureKey?: string;
}

interface NavItem {
  path?: string;
  label: string;
  icon: any;
  featureKey?: string;
  children?: SubNavItem[];
}

// Danh sách menu DÀNH RIÊNG cho Chủ Sàn (Super Admin)
const superAdminNavItems: NavItem[] = [
  { path: '/saas/revenue', label: 'Doanh Thu SaaS', icon: TrendingUp },
  { path: '/saas/tenants', label: 'Quản Lý Shops', icon: Store },
  { path: '/saas/plans', label: 'Gói Cước Cho Thuê', icon: Layers },
  { path: '/saas/platform-settings', label: 'Cấu Hình Sàn', icon: Globe },
];

// Danh sách menu DÀNH CHO KHÁCH THUÊ (Chủ Shop / Khi đang trong chế độ mô phỏng)
const tenantNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard Shop', icon: LayoutDashboard },
  { path: '/subscription', label: 'Gói Cước & Gia Hạn', icon: Zap },
  { path: '/categories', label: 'Danh mục', icon: FolderTree },
  { path: '/products', label: 'Sản phẩm', icon: Package },
  { path: '/accounts', label: 'Nhập kho', icon: Warehouse },
  {
    label: 'Đơn hàng & Giao dịch',
    icon: ShoppingCart,
    children: [
      { path: '/orders', label: 'Danh sách đơn hàng', icon: ClipboardList },
      { path: '/payment-events', label: 'Giao dịch chuyển khoản', icon: Receipt },
    ],
  },
  { path: '/customers', label: 'Khách hàng', icon: Users },
  { path: '/vouchers', label: 'Mã giảm giá', icon: Ticket, featureKey: 'ALLOW_VOUCHERS' },
  { path: '/broadcast', label: 'Phát sóng', icon: Radio, featureKey: 'ALLOW_BROADCAST' },
  { path: '/settings', label: 'Cấu hình Bot & Shop', icon: Settings },
  { path: '/admins', label: 'Nhân viên Shop', icon: UserCog },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const authUser = useSelector((state: RootState) => state.auth.user);
  const { data: meData } = useGetMeQuery();
  const currentUser = meData || authUser;

  const { isSimulating, simulatedPlan } = useSimulation();
  const { hasFeature } = useFeatureGuard();

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Khi đang mô phỏng HOẶC khi là Chủ shop thật -> dùng menu Shop
  // Khi là Super Admin và KHÔNG mô phỏng -> CHỈ dùng menu Sàn SaaS
  const isViewingTenant = isSimulating || !isSuperAdmin;
  const currentNavItems = isViewingTenant ? tenantNavItems : superAdminNavItems;

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
      {/* Brand Header */}
      <div className="p-5 border-b border-[var(--border-color)] flex justify-between items-center">
        <div>
          <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
            BotSaaS Platform
          </h1>
          {isSimulating ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 mt-0.5">
              <Gamepad2 className="w-3 h-3 text-purple-400" /> Mô Phỏng: {simulatedPlan?.name}
            </span>
          ) : isSuperAdmin ? (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 mt-0.5">
              👑 Super Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 mt-0.5">
              🏪 Chủ Shop
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

      {/* Navigation List */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {currentNavItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const hasActiveChild = item.children.some((child) => location.pathname.startsWith(child.path));

            return (
              <div key={item.label} className="space-y-1">
                <button
                  onClick={() => setIsOrderMenuOpen(!isOrderMenuOpen)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                    hasActiveChild
                      ? 'bg-indigo-600/15 text-indigo-400 font-semibold'
                      : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon size={18} className={hasActiveChild ? 'text-indigo-400' : 'text-gray-400'} />
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  {isOrderMenuOpen ? (
                    <ChevronDown size={15} className="text-gray-400 transition-transform duration-200" />
                  ) : (
                    <ChevronRight size={15} className="text-gray-400 transition-transform duration-200" />
                  )}
                </button>

                {isOrderMenuOpen && (
                  <div className="pl-5 pr-2 py-1 space-y-1 border-l border-slate-800 ml-4 animate-in slide-in-from-top-2 duration-200">
                    {item.children.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = location.pathname.startsWith(child.path);
                      const isChildLocked = child.featureKey && isViewingTenant ? !hasFeature(child.featureKey) : false;

                      return (
                        <Link
                          key={child.path}
                          to={isChildLocked ? '#' : child.path}
                          onClick={(e) => {
                            if (isChildLocked) {
                              e.preventDefault();
                              dispatch(setLockedFeatureKey(child.featureKey!));
                              return;
                            }
                            onClose?.();
                          }}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                            isChildActive
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-semibold'
                              : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
                          }`}
                        >
                          <div className="flex items-center space-x-2.5">
                            <ChildIcon size={14} />
                            <span>{child.label}</span>
                          </div>
                          {isChildLocked && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black tracking-wider shadow-sm shadow-cyan-500/20">
                              <Gem size={10} className="text-cyan-300 animate-pulse" />
                              <span>PRO</span>
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isLocked = item.featureKey && isViewingTenant ? !hasFeature(item.featureKey) : false;
          const isActive = location.pathname.startsWith(item.path!);

          return (
            <Link
              key={item.path}
              to={isLocked ? '#' : item.path!}
              onClick={(e) => {
                if (isLocked) {
                  e.preventDefault();
                  dispatch(setLockedFeatureKey(item.featureKey!));
                  return;
                }
                onClose?.();
              }}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                  : isLocked
                  ? 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon size={18} />
                <span className="font-medium text-sm">{item.label}</span>
              </div>

              {/* Huy hiệu Kim Cương 💎 cho tính năng chưa mở khóa */}
              {isLocked && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-black tracking-wider shadow-sm shadow-cyan-500/20">
                  <Gem size={11} className="text-cyan-300 animate-pulse" />
                  <span>PRO</span>
                </span>
              )}
            </Link>
          );
        })}

        {/* Profile menu */}
        <div className="pt-3 border-t border-slate-800 mt-3">
          <Link
            to="/profile"
            onClick={() => onClose?.()}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all ${
              location.pathname.startsWith('/profile')
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 font-semibold'
                : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'
            }`}
          >
            <UserCircle size={18} />
            <span className="font-medium text-sm">Hồ sơ cá nhân</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};
