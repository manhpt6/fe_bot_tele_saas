import { useGetSaasRevenueQuery } from '../api/saasApi';
import {
  TrendingUp,
  DollarSign,
  Store,
  Bot,
  Calendar,
  BarChart3,
} from 'lucide-react';

export const SaasRevenuePage = () => {
  const { data: revenue, isLoading } = useGetSaasRevenueQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <TrendingUp className="w-7 h-7 text-indigo-400" /> Báo Cáo Doanh Thu Nền Tảng Cho Thuê Bot
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Tổng hợp doanh thu từ tiền thuê bot và gia hạn gói cước của các Shop
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Doanh Thu Lũy Kế</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3">
            {Number(revenue?.totalRevenue || 0).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-xs text-slate-500 mt-1">Tính từ khi hệ thống bắt đầu vận hành</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Doanh Thu Tháng Này</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-400 mt-3">
            {Number(revenue?.thisMonthRevenue || 0).toLocaleString('vi-VN')}đ
          </div>
          <div className="text-xs text-slate-500 mt-1">Thực thu chuyển khoản qua SePay</div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Tổng Số Shop Đăng Ký</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Store className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white mt-3">
            {revenue?.totalTenants || 0}
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-medium">
            {revenue?.activeTenants || 0} shop đang hoạt động
          </div>
        </div>

        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
            <span>Bot Telegram Đang Chạy</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Bot className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-sky-400 mt-3">
            {revenue?.runningBots || 0}
          </div>
          <div className="text-xs text-slate-500 mt-1">Multi-Bot Engine Realtime</div>
        </div>
      </div>

      {/* Monthly Breakdown Chart & Table */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-6">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Chi Tiết Doanh Thu 6 Tháng Gần Nhất</h2>
        </div>

        <div className="space-y-4">
          {revenue?.monthlyRevenueChart?.map((m) => {
            const maxRev = Math.max(
              ...revenue.monthlyRevenueChart.map((x) => Number(x.revenue) || 1),
              1
            );
            const percentage = Math.round((Number(m.revenue) / maxRev) * 100);

            return (
              <div key={m.month} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold text-slate-300">{m.month}</span>
                  <span className="font-bold text-indigo-400">
                    {Number(m.revenue).toLocaleString('vi-VN')}đ
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
