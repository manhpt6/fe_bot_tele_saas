import { useState, useEffect } from 'react';
import {
  useGetPlatformConfigQuery,
  useSavePlatformConfigMutation,
  useGetSystemConfigsQuery,
  useUpdateSystemConfigsMutation,
} from '../api/saasApi';
import {
  Settings,
  CreditCard,
  Globe,
  Save,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SaasPlatformSettingsPage = () => {
  const { data: platformConfig, refetch: refetchConfig } = useGetPlatformConfigQuery();
  const { data: systemConfigs, refetch: refetchSys } = useGetSystemConfigsQuery();

  const [savePlatformConfig, { isLoading: isSavingPlatform }] = useSavePlatformConfigMutation();
  const [updateSystemConfigs, { isLoading: isSavingSys }] = useUpdateSystemConfigsMutation();

  const [formData, setFormData] = useState({
    bankName: 'MBBank',
    bankCode: 'MB',
    accountNumber: '',
    accountHolder: '',
    webhookProvider: 'SEPAY',
    webhookApiKey: '',
    isActive: true,
  });

  const [sysFormData, setSysFormData] = useState({
    WEBHOOK_BASE_URL: 'https://api.yourdomain.com',
    BOT_DEFAULT_MODE: 'WEBHOOK',
  });

  useEffect(() => {
    if (platformConfig) {
      setFormData({
        bankName: platformConfig.bankName || 'MBBank',
        bankCode: platformConfig.bankCode || 'MB',
        accountNumber: platformConfig.accountNumber || '',
        accountHolder: platformConfig.accountHolder || '',
        webhookProvider: platformConfig.webhookProvider || 'SEPAY',
        webhookApiKey: platformConfig.webhookApiKey || '',
        isActive: platformConfig.isActive ?? true,
      });
    }
  }, [platformConfig]);

  useEffect(() => {
    if (systemConfigs) {
      setSysFormData({
        WEBHOOK_BASE_URL: systemConfigs.WEBHOOK_BASE_URL || 'https://api.yourdomain.com',
        BOT_DEFAULT_MODE: systemConfigs.BOT_DEFAULT_MODE || 'WEBHOOK',
      });
    }
  }, [systemConfigs]);

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await savePlatformConfig(formData).unwrap();
      toast.success('Cập nhật tài khoản thanh toán của sàn thành công!');
      refetchConfig();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể lưu cấu hình');
    }
  };

  const handleSysSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSystemConfigs(sysFormData).unwrap();
      toast.success('Cập nhật thông số hệ thống thành công!');
      refetchSys();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể lưu cấu hình hệ thống');
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" /> Cấu Hình Nền Tảng & Cổng Thanh Toán Sàn
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Thiết lập tài khoản ngân hàng nhận tiền thuê bot từ các Shop và Domain Webhook Telegram
        </p>
      </div>

      {/* 1. Platform Payment Config (SePay) */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Tài Khoản SePay Nhận Tiền Thuê Bot (Chủ Sàn)</h2>
        </div>
        <p className="text-xs text-slate-400 mb-6">
          Khi các shop chuyển khoản mua gói cước, tiền sẽ chuyển về số tài khoản này và SePay gửi webhook đối soát tự động.
        </p>

        <form onSubmit={handlePlatformSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tên ngân hàng</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankName: e.target.value }))}
                placeholder="MBBank"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mã ngân hàng (VietQR Code)</label>
              <input
                type="text"
                value={formData.bankCode}
                onChange={(e) => setFormData((prev) => ({ ...prev, bankCode: e.target.value }))}
                placeholder="MB"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Số tài khoản</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                placeholder="0988888888"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tên chủ tài khoản (Không dấu)</label>
              <input
                type="text"
                value={formData.accountHolder}
                onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value.toUpperCase() }))}
                placeholder="NGUYEN VAN A"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white uppercase focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">SePay Webhook API Key</label>
            <input
              type="password"
              value={formData.webhookApiKey}
              onChange={(e) => setFormData((prev) => ({ ...prev, webhookApiKey: e.target.value }))}
              placeholder="Nhập API Key SePay để bảo mật webhook"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-400 space-y-1">
            <div>
              <strong>Webhook URL cấu hình trên SePay:</strong>
            </div>
            <code className="text-indigo-400 font-mono bg-slate-900 px-2 py-1 rounded block">
              {sysFormData.WEBHOOK_BASE_URL}/api/webhook/saas-payment
            </code>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingPlatform}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Lưu Tài Khoản Sàn
            </button>
          </div>
        </form>
      </div>

      {/* 2. System Config */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">Thông Số Hệ Thống & Webhook Telegram</h2>
        </div>

        <form onSubmit={handleSysSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Public Base Webhook URL (Bắt buộc HTTPS)
            </label>
            <input
              type="url"
              value={sysFormData.WEBHOOK_BASE_URL}
              onChange={(e) =>
                setSysFormData((prev) => ({ ...prev, WEBHOOK_BASE_URL: e.target.value }))
              }
              placeholder="https://api.yourdomain.com"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Domain công khai để Telegram gửi webhook update vào: <code>{sysFormData.WEBHOOK_BASE_URL}/api/webhook/telegram/&#123;botUsername&#125;</code>
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Chế độ chạy mặc định khi bot mới kết nối
            </label>
            <select
              value={sysFormData.BOT_DEFAULT_MODE}
              onChange={(e) =>
                setSysFormData((prev) => ({ ...prev, BOT_DEFAULT_MODE: e.target.value }))
              }
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
            >
              <option value="WEBHOOK">WEBHOOK (Khuyên dùng khi chạy Production)</option>
              <option value="LONG_POLLING">LONG POLLING (Dành cho Local Dev)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingSys}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20"
            >
              <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
