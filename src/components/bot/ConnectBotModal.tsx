import React, { useState } from 'react';
import { Bot, Lock, ShieldCheck, X, Loader2, Globe, Radio, AlertCircle } from 'lucide-react';
import { useConnectBotMutation } from '../../api/botConfigApi';
import { BotMode } from '../../types';
import toast from 'react-hot-toast';

interface ConnectBotModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectBotModal: React.FC<ConnectBotModalProps> = ({ isOpen, onClose }) => {
  const [botToken, setBotToken] = useState('');
  const [mode, setMode] = useState<BotMode>('LONG_POLLING');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [connectBot, { isLoading }] = useConnectBotMutation();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!botToken.trim()) {
      toast.error('Vui lòng nhập Bot Token từ @BotFather');
      return;
    }
    if (!adminPassword.trim()) {
      toast.error('Vui lòng nhập mật khẩu tài khoản Admin để xác thực');
      return;
    }
    if (mode === 'WEBHOOK' && (!webhookUrl.trim() || !webhookUrl.startsWith('https://'))) {
      toast.error('Chế độ Webhook yêu cầu URL hợp lệ bắt đầu bằng https://');
      return;
    }

    try {
      const result = await connectBot({
        botToken: botToken.trim(),
        mode,
        webhookUrl: mode === 'WEBHOOK' ? webhookUrl.trim() : undefined,
        adminPassword: adminPassword.trim(),
      }).unwrap();

      toast.success(`Đã kết nối thành công với Bot @${result.botUsername}!`);
      onClose();
      setBotToken('');
      setAdminPassword('');
      setWebhookUrl('');
    } catch (err: any) {
      const msg = err?.data?.message || err?.error || 'Kết nối Telegram Bot thất bại';
      toast.error(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Bot size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Kết Nối Telegram Bot</h3>
              <p className="text-xs text-slate-400">Cấu hình Bot Telegram kinh doanh tự động</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Telegram Bot Token (từ @BotFather)</span>
              <a
                href="https://t.me/BotFather"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:underline"
              >
                Lấy token ở @BotFather
              </a>
            </label>
            <input
              type="password"
              required
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="VD: 123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Phương thức nhận tin nhắn (Mode)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('LONG_POLLING')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  mode === 'LONG_POLLING'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Radio size={16} className={`mt-0.5 shrink-0 ${mode === 'LONG_POLLING' ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Long Polling</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Không cần domain/SSL (Khuyên dùng nội bộ/Dev)</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('WEBHOOK')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                  mode === 'WEBHOOK'
                    ? 'border-blue-500 bg-blue-500/10 text-white'
                    : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                }`}
              >
                <Globe size={16} className={`mt-0.5 shrink-0 ${mode === 'WEBHOOK' ? 'text-blue-400' : 'text-slate-500'}`} />
                <div>
                  <div className="text-xs font-bold">Webhook (HTTPS)</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Tốc độ tức thì, cần Public Domain có SSL</div>
                </div>
              </button>
            </div>
          </div>

          {mode === 'WEBHOOK' && (
            <div className="space-y-1.5 animate-in fade-in duration-200">
              <label className="block text-xs font-semibold text-slate-300">
                Webhook Public URL (HTTPS)
              </label>
              <input
                type="url"
                required={mode === 'WEBHOOK'}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://api.yourdomain.com/api/v1/telegram/webhook"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
          )}

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Lock size={14} className="text-amber-400" />
              <span>Xác thực Mật khẩu Quản trị (Sudo Verification)</span>
            </div>
            <input
              type="password"
              required
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              placeholder="Nhập mật khẩu tài khoản Admin hiện tại"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isLoading || !botToken.trim() || !adminPassword.trim()}
              className="w-1/2 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-colors"
            >
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
              <span>{isLoading ? 'Đang kết nối...' : 'Xác Nhận & Kết Nối'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
