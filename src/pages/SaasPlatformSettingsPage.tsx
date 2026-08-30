import { useState, useEffect, useRef } from 'react';
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
  Search,
  ChevronDown,
  Copy,
  Check,
  ExternalLink,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  BookOpen,
  X,
  QrCode,
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

  // SePay Webhook URL theo domain cấu hình hệ thống do chủ sàn nhập
  const sepayWebhookUrl = `${(sysFormData.WEBHOOK_BASE_URL || 'https://api.yourdomain.com').replace(/\/+$/, '')}/api/webhook/saas-payment`;

  // UI state
  const [isCopiedWebhook, setIsCopiedWebhook] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showSePayGuide, setShowSePayGuide] = useState(false);

  // Bank selector
  const [banks, setBanks] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchBank, setSearchBank] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Password Modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Fetch VietQR Banks list
  useEffect(() => {
    fetch('https://api.vietqr.io/v2/banks')
      .then((res) => res.json())
      .then((data) => {
        if (data?.data) setBanks(data.data);
      })
      .catch((err) => console.error('Error fetching banks:', err));
  }, []);

  // Close bank dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load config data into state
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

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(sepayWebhookUrl);
    setIsCopiedWebhook(true);
    toast.success('Đã sao chép URL Webhook SePay của sàn!');
    setTimeout(() => setIsCopiedWebhook(false), 2000);
  };

  const handleOpenPasswordModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountNumber.trim()) {
      toast.error('Vui lòng nhập Số tài khoản ngân hàng');
      return;
    }
    if (!formData.accountHolder.trim()) {
      toast.error('Vui lòng nhập Tên chủ tài khoản');
      return;
    }
    setAdminPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleConfirmSavePlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu Admin');
      return;
    }
    try {
      await savePlatformConfig({ ...formData, adminPassword }).unwrap();
      toast.success('Cập nhật tài khoản thanh toán của sàn thành công!');
      setIsPasswordModalOpen(false);
      setAdminPassword('');
      refetchConfig();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể lưu cấu hình, vui lòng kiểm tra lại mật khẩu');
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
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" /> Cấu Hình Nền Tảng & Cổng Thanh Toán Sàn
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Thiết lập tài khoản ngân hàng nhận tiền thuê bot từ các Shop và Domain Webhook Telegram
        </p>
      </div>

      {/* 1. Platform Payment Config (SePay) & Live VietQR Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form bên trái: 7 cột */}
        <div className="lg:col-span-7 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Tài Khoản SePay Nhận Tiền Thuê Bot (Chủ Sàn)</h2>
              <p className="text-xs text-slate-400">
                Khi các shop gia hạn hoặc mua gói cước, tiền sẽ chuyển về STK này và SePay bắn webhook tự động kích hoạt.
              </p>
            </div>
          </div>

          <form onSubmit={handleOpenPasswordModal} className="space-y-4 text-sm">
            {/* Dropdown Chọn Ngân hàng */}
            <div className="relative" ref={dropdownRef}>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Ngân hàng (VietQR Code)
              </label>
              <div
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white cursor-pointer flex justify-between items-center text-sm hover:border-indigo-500 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className={formData.bankName ? 'text-white font-medium' : 'text-slate-400'}>
                  {formData.bankName
                    ? banks.find((b) => b.code === formData.bankCode || b.shortName === formData.bankName)?.name
                      ? `${formData.bankName} - ${banks.find((b) => b.code === formData.bankCode || b.shortName === formData.bankName)?.name}`
                      : formData.bankName
                    : '-- Chọn Ngân hàng --'}
                </span>
                <ChevronDown size={18} className="text-slate-400" />
              </div>

              {isDropdownOpen && (
                <div className="absolute z-30 w-full mt-1 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2.5 border-b border-slate-700/60 flex items-center space-x-2 bg-slate-800 sticky top-0">
                    <Search size={16} className="text-slate-400" />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Tìm ngân hàng (VD: MB, Vietcombank, Techcombank...)"
                      value={searchBank}
                      onChange={(e) => setSearchBank(e.target.value)}
                      className="w-full bg-transparent text-white focus:outline-none text-xs"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto custom-scrollbar divide-y divide-slate-700/30">
                    {banks
                      .filter(
                        (bank) =>
                          bank.name?.toLowerCase().includes(searchBank.toLowerCase()) ||
                          bank.shortName?.toLowerCase().includes(searchBank.toLowerCase()) ||
                          bank.code?.toLowerCase().includes(searchBank.toLowerCase())
                      )
                      .map((bank: any) => (
                        <div
                          key={bank.id || bank.code}
                          className="px-4 py-2.5 hover:bg-indigo-600/20 cursor-pointer text-xs flex items-center justify-between transition-colors"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              bankName: bank.shortName,
                              bankCode: bank.code,
                            }));
                            setIsDropdownOpen(false);
                            setSearchBank('');
                          }}
                        >
                          <div>
                            <span className="font-bold text-indigo-400 mr-2">{bank.shortName}</span>
                            <span className="text-slate-300">{bank.name}</span>
                          </div>
                          {bank.logo && (
                            <img src={bank.logo} alt={bank.shortName} className="h-4 object-contain ml-2" />
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Số tài khoản & Tên chủ tài khoản */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Số tài khoản</label>
                <input
                  type="text"
                  required
                  value={formData.accountNumber}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="0988888888"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tên chủ tài khoản (Không dấu)</label>
                <input
                  type="text"
                  required
                  value={formData.accountHolder}
                  onChange={(e) => setFormData((prev) => ({ ...prev, accountHolder: e.target.value.toUpperCase() }))}
                  placeholder="NGUYEN VAN A"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-semibold"
                />
              </div>
            </div>

            {/* SePay Webhook URL với nút Copy */}
            <div className="space-y-1.5 pt-2">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  🔗 <strong>URL Webhook Sàn</strong> (Dán vào SePay)
                </span>
                <span className="text-[11px] text-emerald-400 font-medium">Tự động nhận diện Domain Server</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={sepayWebhookUrl}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-indigo-300 font-mono select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyWebhook}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-md shadow-indigo-600/20"
                >
                  {isCopiedWebhook ? <Check size={14} className="text-white" /> : <Copy size={14} />}
                  <span>{isCopiedWebhook ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
            </div>

            {/* Hướng dẫn kết nối SePay 3 bước */}
            <div className="bg-indigo-950/30 border border-indigo-800/40 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                  <BookOpen size={15} className="text-indigo-400" />
                  Hướng dẫn kết nối SePay Sàn trong 3 bước
                </span>
                <button
                  type="button"
                  onClick={() => setShowSePayGuide(!showSePayGuide)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-medium"
                >
                  {showSePayGuide ? 'Thu gọn' : 'Xem chi tiết'}
                </button>
              </div>

              {showSePayGuide && (
                <div className="text-xs text-slate-300 space-y-2 pt-2 border-t border-indigo-900/40 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">1</span>
                    <div>
                      Đăng nhập <a href="https://my.sepay.vn" target="_blank" rel="noreferrer" className="text-indigo-400 underline font-medium inline-flex items-center gap-0.5">my.sepay.vn <ExternalLink size={11} /></a> $\rightarrow$ Menu bên trái chọn <strong>Tích hợp Webhook</strong> $\rightarrow$ Bấm <strong>Tạo Webhook mới</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">2</span>
                    <div>
                      Dán <strong>URL Webhook Sàn</strong> vừa sao chép ở trên vào ô URL. Điều kiện gửi chọn <strong>"Gửi tất cả giao dịch"</strong>.
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">3</span>
                    <div>
                      Lấy <strong>API Key</strong> trên SePay dán vào ô bên dưới $\rightarrow$ Bấm <strong>Lưu Tài Khoản Sàn</strong>.
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SePay Webhook API Key với Ẩn/Hiện */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">SePay Webhook API Key</label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={formData.webhookApiKey}
                  onChange={(e) => setFormData((prev) => ({ ...prev, webhookApiKey: e.target.value }))}
                  placeholder="Nhập API Key SePay để bảo mật webhook"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white pr-10 text-sm font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
              >
                <Save className="w-4 h-4" /> Lưu Tài Khoản Sàn
              </button>
            </div>
          </form>
        </div>

        {/* Khung bên phải: Mô phỏng Live VietQR Preview (5 cột) */}
        <div className="lg:col-span-5 bg-slate-900/60 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center">
          <div className="flex items-center gap-2 mb-4 w-full justify-center">
            <QrCode className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Mô phỏng VietQR Thanh Toán Sàn</h3>
          </div>

          <div className="w-full bg-slate-950/60 rounded-xl p-5 border border-slate-800/80 flex flex-col items-center justify-center min-h-[300px]">
            {formData.bankCode && formData.accountNumber ? (
              <div className="space-y-3 flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                <img
                  key={`${formData.bankCode}-${formData.accountNumber}`}
                  src={`https://img.vietqr.io/image/${formData.bankCode}-${formData.accountNumber}-compact2.png?amount=100000&addInfo=NAPTENANT%201&accountName=${encodeURIComponent(formData.accountHolder || '')}`}
                  alt="VietQR Sàn"
                  className="w-48 h-48 rounded-xl shadow-xl bg-white p-2 border border-slate-200"
                />
                <div>
                  <p className="text-white font-bold text-sm">
                    {formData.bankName} — {formData.accountNumber}
                  </p>
                  <p className="text-indigo-400 text-xs font-semibold uppercase tracking-wider">
                    {formData.accountHolder || 'CHỦ TÀI KHOẢN'}
                  </p>
                  <p className="text-slate-500 text-[11px] mt-1.5">
                    Mã QR này sẽ hiển thị khi Shop mua hoặc gia hạn gói cước. Quét thử bằng app ngân hàng để kiểm tra!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-slate-500 text-xs space-y-2 py-8">
                <QrCode size={40} className="mx-auto opacity-30" />
                <p>Vui lòng chọn Ngân hàng và điền Số tài khoản để xem trước mã VietQR.</p>
              </div>
            )}
          </div>
        </div>
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
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
            <p className="text-xs text-slate-500 mt-1">
              Domain công khai để Telegram gửi webhook update vào: <code>{(sysFormData.WEBHOOK_BASE_URL || 'https://api.yourdomain.com').replace(/\/+$/, '')}/api/webhook/telegram/&#123;botUsername&#125;</code>
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
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="WEBHOOK">WEBHOOK (Khuyên dùng khi chạy Production)</option>
              <option value="LONG_POLLING">LONG POLLING (Dành cho Local Dev)</option>
            </select>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSavingSys}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/25 transition-all"
            >
              <Save className="w-4 h-4" /> Lưu Cấu Hình Hệ Thống
            </button>
          </div>
        </form>
      </div>

      {/* MODAL XÁC THỰC MẬT KHẨU ADMIN */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Xác Nhận Bảo Mật Quản Trị Sàn</h3>
                  <p className="text-xs text-slate-400">Yêu cầu quyền Platform Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setAdminPassword('');
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-amber-950/40 border border-amber-800/40 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-200 leading-relaxed">
              <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
              <div>
                Bạn đang thay đổi <strong>Số tài khoản nhận tiền sàn</strong> hoặc <strong>Khóa Webhook SePay</strong>. Vui lòng nhập mật khẩu Platform Admin để xác nhận lưu.
              </div>
            </div>

            <form onSubmit={handleConfirmSavePlatform} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Lock size={14} className="text-indigo-400" />
                  Mật khẩu tài khoản Platform Admin
                </label>
                <div className="relative">
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    autoFocus
                    required
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Nhập mật khẩu Admin của bạn"
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showAdminPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPasswordModalOpen(false);
                    setAdminPassword('');
                  }}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingPlatform || !adminPassword.trim()}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-colors"
                >
                  {isSavingPlatform ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                  <span>{isSavingPlatform ? 'Đang lưu...' : 'Xác Nhận & Lưu'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
