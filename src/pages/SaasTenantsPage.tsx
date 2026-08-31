import { useState } from 'react';
import {
  useGetSaasTenantsQuery,
  useUpdateTenantStatusMutation,
  useExtendTenantSubscriptionMutation,
  useGetPublicPlansQuery,
  useGetTenantMetricsQuery,
  useGetTenantPaymentsQuery,
  SaasTenantSummary,
} from '../api/saasApi';
import {
  Store,
  Search,
  CheckCircle,
  AlertOctagon,
  CalendarPlus,
  Lock,
  Eye,
  X,
  Activity,
  CreditCard,
  Users,
  Package,
  ShoppingCart,
  Bot,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

interface TenantDetailDrawerProps {
  tenant: SaasTenantSummary | null;
  onClose: () => void;
}

const TenantDetailDrawer = ({ tenant, onClose }: TenantDetailDrawerProps) => {
  const [activeTab, setActiveTab] = useState<'METRICS' | 'PAYMENTS'>('METRICS');

  const {
    data: metrics,
    isLoading: isMetricsLoading,
    refetch: refetchMetrics,
  } = useGetTenantMetricsQuery(tenant?.id ?? 0, { skip: !tenant });

  const {
    data: payments,
    isLoading: isPaymentsLoading,
    refetch: refetchPayments,
  } = useGetTenantPaymentsQuery(tenant?.id ?? 0, { skip: !tenant });

  if (!tenant) return null;

  const calculateQuota = (current: number, max: number | null | undefined) => {
    if (max === null || max === undefined || max < 0) {
      return {
        percent: 0,
        isUnlimited: true,
        color: 'bg-indigo-500',
        textColor: 'text-indigo-400',
        label: 'Không giới hạn (∞)',
      };
    }
    if (max === 0) {
      return {
        percent: 100,
        isUnlimited: false,
        color: 'bg-rose-500',
        textColor: 'text-rose-400',
        label: '0 (Chưa cấp)',
      };
    }
    const percent = Math.min(Math.round((current / max) * 100), 100);
    let color = 'bg-emerald-500';
    let textColor = 'text-emerald-400';
    if (percent >= 90) {
      color = 'bg-rose-500';
      textColor = 'text-rose-400';
    } else if (percent >= 70) {
      color = 'bg-amber-500';
      textColor = 'text-amber-400';
    }
    return {
      percent,
      isUnlimited: false,
      color,
      textColor,
      label: `${max.toLocaleString('vi-VN')}`,
    };
  };

  const productQuota = calculateQuota(metrics?.currentProducts || 0, metrics?.maxProducts);
  const staffQuota = calculateQuota(metrics?.currentStaff || 0, metrics?.maxStaff);
  const orderQuota = calculateQuota(metrics?.currentOrdersThisMonth || 0, metrics?.maxOrdersPerMonth);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full max-h-[88vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between bg-slate-900/90 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white">{tenant.shopName}</h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                #{tenant.tenantCode}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Chủ shop: <span className="text-slate-200 font-medium">{tenant.ownerUsername}</span> • Gói hiện tại:{' '}
              <span className="text-indigo-400 font-medium">{tenant.currentPlan?.name || 'Chưa đăng ký'}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('METRICS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'METRICS'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" /> Chỉ số & Tài nguyên
          </button>
          <button
            onClick={() => setActiveTab('PAYMENTS')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition ${
              activeTab === 'PAYMENTS'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" /> Lịch sử Nạp tiền ({payments?.length || 0})
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'METRICS' && (
            <div className="space-y-6">
              {/* Top Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Khách hàng Telegram</span>
                    <Users className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div className="text-2xl font-black text-white mt-2">
                    {metrics?.totalCustomers?.toLocaleString('vi-VN') || 0}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">Đã tương tác với Bot của shop</p>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400 font-medium">Trạng thái Bot</span>
                    <Bot className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white mt-2">
                    {tenant.botUsername ? `@${tenant.botUsername}` : 'Chưa gắn bot'}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {tenant.isBotRunning ? '🟢 Đang hoạt động Realtime' : '⚪ Đang tạm dừng'}
                  </p>
                </div>
              </div>

              {/* Resource Limit Progress Bars */}
              <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-800 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" /> Hạn Mức Tài Nguyên Gói Cước
                  </h3>
                  <button
                    onClick={() => refetchMetrics()}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs flex items-center gap-1"
                    title="Làm mới số liệu"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isMetricsLoading ? (
                  <div className="py-8 text-center text-xs text-slate-500">Đang kiểm tra mức sử dụng tài nguyên...</div>
                ) : (
                  <div className="space-y-4 text-xs">
                    {/* Sản phẩm */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <Package className="w-3.5 h-3.5 text-indigo-400" /> Sản phẩm trong kho:
                        </span>
                        <span className="font-bold text-slate-200">
                          {metrics?.currentProducts || 0} /{' '}
                          <span className={productQuota.textColor}>{productQuota.label}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${productQuota.color}`}
                          style={{ width: `${productQuota.isUnlimited ? 15 : productQuota.percent}%` }}
                        />
                      </div>
                      {productQuota.percent >= 90 && !productQuota.isUnlimited && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Sắp chạm hạn mức tối đa của gói!
                        </p>
                      )}
                    </div>

                    {/* Đơn hàng trong chu kỳ */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <ShoppingCart className="w-3.5 h-3.5 text-indigo-400" /> Đơn hàng (Chu kỳ tháng này):
                        </span>
                        <span className="font-bold text-slate-200">
                          {metrics?.currentOrdersThisMonth || 0} /{' '}
                          <span className={orderQuota.textColor}>{orderQuota.label}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${orderQuota.color}`}
                          style={{ width: `${orderQuota.isUnlimited ? 15 : orderQuota.percent}%` }}
                        />
                      </div>
                      {orderQuota.percent >= 90 && !orderQuota.isUnlimited && (
                        <p className="text-[11px] text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Đã dùng hết {orderQuota.percent}% hạn mức đơn hàng tháng này!
                        </p>
                      )}
                    </div>

                    {/* Nhân viên */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 flex items-center gap-1.5 font-medium">
                          <Users className="w-3.5 h-3.5 text-indigo-400" /> Tài khoản Nhân viên:
                        </span>
                        <span className="font-bold text-slate-200">
                          {metrics?.currentStaff || 0} /{' '}
                          <span className={staffQuota.textColor}>{staffQuota.label}</span>
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${staffQuota.color}`}
                          style={{ width: `${staffQuota.isUnlimited ? 15 : staffQuota.percent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Lịch Sử Giao Dịch Mua Gói</h3>
                <button
                  onClick={() => refetchPayments()}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Làm mới
                </button>
              </div>

              {isPaymentsLoading ? (
                <div className="py-12 text-center text-xs text-slate-500">Đang tải lịch sử thanh toán...</div>
              ) : !payments || payments.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 bg-slate-800/30 rounded-xl border border-slate-800">
                  Shop này chưa có giao dịch thanh toán nào phát sinh.
                </div>
              ) : (
                <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 overflow-hidden bg-slate-800/30 max-h-96 overflow-y-auto">
                  {payments.map((p) => (
                    <div key={p.id} className="p-4 hover:bg-slate-800/50 transition text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-mono text-indigo-300 font-bold">{p.paymentCode}</div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === 'PAID'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {p.status === 'PAID'
                            ? 'THÀNH CÔNG'
                            : p.status === 'PENDING'
                            ? 'CHỜ CHUYỂN KHOẢN'
                            : p.status === 'EXPIRED'
                            ? 'HẾT HẠN'
                            : 'ĐÃ HỦY'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-slate-300">
                        <div>
                          Gói: <strong className="text-white">{p.planName}</strong> ({p.durationMonths} tháng)
                        </div>
                        <div className="font-bold text-emerald-400 text-sm">
                          {Number(p.amount).toLocaleString('vi-VN')} đ
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                        <span>Ngày tạo: {new Date(p.createdAt).toLocaleString('vi-VN')}</span>
                        {p.paidAt && (
                          <span className="text-emerald-400/80">
                            Thanh toán: {new Date(p.paidAt).toLocaleTimeString('vi-VN')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold transition"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export const SaasTenantsPage = () => {
  const { data: tenants, isLoading, refetch } = useGetSaasTenantsQuery();
  const { data: plans } = useGetPublicPlansQuery();

  const [updateStatus] = useUpdateTenantStatusMutation();
  const [extendSub, { isLoading: isExtending }] = useExtendTenantSubscriptionMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [detailModalTenant, setDetailModalTenant] = useState<SaasTenantSummary | null>(null);
  const [extendModalTenant, setExtendModalTenant] = useState<SaasTenantSummary | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(1);
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [adminPassword, setAdminPassword] = useState<string>('');

  const handleStatusChange = async (tenantId: number, newStatus: string) => {
    try {
      await updateStatus({ id: tenantId, status: newStatus }).unwrap();
      toast.success('Cập nhật trạng thái Shop thành công!');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleExtendSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendModalTenant) return;
    if (!adminPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu Quản trị để xác nhận!');
      return;
    }

    try {
      await extendSub({
        id: extendModalTenant.id,
        planId: selectedPlanId,
        months: extendMonths,
        adminPassword: adminPassword.trim(),
      }).unwrap();
      toast.success(`Đã gia hạn/chuyển gói thành công ${extendMonths} tháng cho shop ${extendModalTenant.shopName}`);
      setExtendModalTenant(null);
      setAdminPassword('');
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Mật khẩu sai hoặc thao tác thất bại');
    }
  };

  const filteredTenants = tenants?.filter((t) => {
    const matchSearch =
      t.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.tenantCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.ownerUsername.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Store className="w-7 h-7 text-indigo-400" /> Quản Lý Danh Sách Các Shop (Tenants)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Tổng số: <strong className="text-white">{tenants?.length || 0}</strong> shop đang đăng ký trên sàn
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên shop, mã shop, username chủ shop..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">Tất cả trạng thái</option>
          <option value="ACTIVE">Hoạt động (ACTIVE)</option>
          <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
          <option value="BANNED">Đã khóa (BANNED)</option>
        </select>
      </div>

      {/* Tenants Table */}
      <div className="bg-slate-900/60 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-slate-500">Đang tải danh sách shop...</div>
        ) : !filteredTenants || filteredTenants.length === 0 ? (
          <div className="py-12 text-center text-slate-500">Không tìm thấy shop nào.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-800/80 text-slate-400 border-b border-slate-700">
                <tr>
                  <th className="py-3 px-4">Tên Shop / Mã</th>
                  <th className="py-3 px-4">Chủ sở hữu</th>
                  <th className="py-3 px-4">Bot Telegram</th>
                  <th className="py-3 px-4">Gói cước / Hạn</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredTenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-base">{t.shopName}</div>
                      <div className="text-xs text-indigo-400 font-mono">#{t.tenantCode}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-200">{t.ownerUsername}</div>
                      <div className="text-xs text-slate-500">{t.ownerEmail || t.ownerPhone || 'Chưa cập nhật'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {t.botUsername ? (
                        <div>
                          <div className="font-mono text-xs text-white">@{t.botUsername}</div>
                          <div
                            className={`text-xs font-semibold mt-0.5 ${
                              t.isBotRunning ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {t.isBotRunning ? '🟢 Đang chạy' : '⚪ Đã tắt'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500 italic">Chưa kết nối</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-200">
                        {t.currentPlan?.name || 'Chưa đăng ký'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Còn lại: <strong className="text-indigo-300">{t.daysRemaining} ngày</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          t.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.status === 'SUSPENDED'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {t.status === 'ACTIVE'
                          ? 'Hoạt động'
                          : t.status === 'SUSPENDED'
                          ? 'Tạm ngưng'
                          : 'Bị khóa'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => setDetailModalTenant(t)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold inline-flex items-center gap-1 border border-slate-700 transition"
                        title="Xem chi tiết chỉ số & lịch sử nạp tiền"
                      >
                        <Eye className="w-3.5 h-3.5 text-indigo-400" /> Chi tiết
                      </button>

                      <button
                        onClick={() => {
                          setExtendModalTenant(t);
                          if (t.currentPlan) setSelectedPlanId(t.currentPlan.id);
                        }}
                        className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-medium inline-flex items-center gap-1"
                        title="Tặng / Gia hạn thêm ngày"
                      >
                        <CalendarPlus className="w-3.5 h-3.5" /> Gia hạn
                      </button>

                      {t.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleStatusChange(t.id, 'BANNED')}
                          className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-medium inline-flex items-center gap-1"
                          title="Khóa Shop"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" /> Khóa
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(t.id, 'ACTIVE')}
                          className="px-2.5 py-1 rounded bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-medium inline-flex items-center gap-1"
                          title="Mở khóa Shop"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Kích hoạt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tenant Detail Drawer */}
      <TenantDetailDrawer
        tenant={detailModalTenant}
        onClose={() => setDetailModalTenant(null)}
      />

      {/* Manual Extend Subscription Modal */}
      {extendModalTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <CalendarPlus className="w-5 h-5 text-indigo-400" />
              Gia Hạn Thủ Công: {extendModalTenant.shopName}
            </h3>

            <form onSubmit={handleExtendSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Chọn gói cước áp dụng
                </label>
                <select
                  value={selectedPlanId}
                  onChange={(e) => setSelectedPlanId(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                >
                  {plans?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({Number(p.priceMonthly).toLocaleString('vi-VN')}đ/tháng)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Số tháng gia hạn thêm
                </label>
                <input
                  type="number"
                  min="1"
                  max="36"
                  value={extendMonths}
                  onChange={(e) => setExtendMonths(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" /> Mật khẩu Quản trị viên (Bắt buộc xác nhận)
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu đăng nhập của bạn..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-amber-500/40 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm placeholder:text-slate-500"
                  required
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Thao tác thay đổi gói cước nhạy cảm, yêu cầu xác thực mật khẩu chính chủ.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setExtendModalTenant(null);
                    setAdminPassword('');
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isExtending}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
                >
                  <Lock className="w-3.5 h-3.5" />
                  {isExtending ? 'Đang xác thực...' : 'Xác nhận thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
