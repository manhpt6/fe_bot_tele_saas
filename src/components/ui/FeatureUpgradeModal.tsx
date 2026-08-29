import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gem, Sparkles, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { FEATURE_METAS } from '../../config/features';

interface FeatureUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  featureKey: string | null;
}

export const FeatureUpgradeModal: React.FC<FeatureUpgradeModalProps> = ({
  isOpen,
  onClose,
  featureKey,
}) => {
  const navigate = useNavigate();

  if (!isOpen || !featureKey) return null;

  const meta = FEATURE_METAS[featureKey] || {
    name: 'Tính năng cao cấp',
    tagline: 'Nâng cấp để bứt phá doanh số',
    description: 'Tính năng này yêu cầu gói cước cao hơn để kích hoạt và sử dụng.',
    minPlanName: 'Gói Nâng Cao',
    highlights: ['Trải nghiệm đầy đủ công cụ bán hàng mạnh mẽ nhất'],
  };

  const handleUpgrade = () => {
    onClose();
    navigate('/subscription');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-cyan-500/30 p-7 shadow-2xl shadow-cyan-950/50 animate-in zoom-in-95 duration-200">
        {/* Nút đóng */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
        >
          <X size={20} />
        </button>

        {/* Header với Icon Kim Cương phát sáng */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-indigo-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 shadow-lg shadow-cyan-500/20">
            <Gem className="w-8 h-8 animate-pulse text-cyan-300" />
            <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-extrabold uppercase tracking-wider mb-1">
              <Gem className="w-3 h-3" />
              <span>Yêu cầu {meta.minPlanName}</span>
            </div>
            <h3 className="text-xl font-black text-white">{meta.name}</h3>
          </div>
        </div>

        {/* Tagline & Description */}
        <p className="text-sm font-semibold text-cyan-200/90 mb-2">{meta.tagline}</p>
        <p className="text-xs text-slate-400 leading-relaxed mb-5">{meta.description}</p>

        {/* Danh sách quyền lợi nổi bật */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5 mb-6">
          <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quyền lợi khi mở khóa tính năng:
          </div>
          {meta.highlights.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        {/* Hành động */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold transition cursor-pointer"
          >
            Để sau
          </button>
          <button
            type="button"
            onClick={handleUpgrade}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-extrabold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition hover:scale-[1.02] cursor-pointer"
          >
            <span>Nâng Cấp Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
