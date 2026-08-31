import { useState } from 'react';
import {
  useGetSaasTenantsQuery,
  useUpdateTenantStatusMutation,
  useExtendTenantSubscriptionMutation,
  useGetPublicPlansQuery,
  SaasTenantSummary,
} from '../api/saasApi';
import {
  Store,
  Search,
  CheckCircle,
  AlertOctagon,
  CalendarPlus,
  Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SaasTenantsPage = () => {
  const { data: tenants, isLoading, refetch } = useGetSaasTenantsQuery();
  const { data: plans } = useGetPublicPlansQuery();

  const [updateStatus] = useUpdateTenantStatusMutation();
  const [extendSub, { isLoading: isExtending }] = useExtendTenantSubscriptionMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

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
