import React from 'react';
import { useFeatureGuard } from '../hooks/use-feature-guard';
import { Gem, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FEATURE_METAS } from '../config/features';

interface FeatureGateProps {
  featureKey?: string;
  featureName?: string;
  error?: any;
  children: React.ReactNode;
  /** Nếu true, ẩn hoàn toàn thay vì hiển thị banner nâng cấp */
  hideIfLocked?: boolean;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  featureKey: propFeatureKey,
  featureName,
  error,
  children,
  hideIfLocked = false,
}) => {
  const { hasFeature } = useFeatureGuard();
  const navigate = useNavigate();

  // Kiểm tra lỗi 403 FeatureAccessDenied từ Backend
  const backendFeatureKey =
    error && error.status === 403
      ? error.data?.data?.featureKey || error.data?.featureKey
      : undefined;

  const featureKey = propFeatureKey || backendFeatureKey;

  const isLocked =
    Boolean(backendFeatureKey) || (featureKey ? !hasFeature(featureKey) : false);

  if (!isLocked) {
    return <>{children}</>;
  }

  if (hideIfLocked) {
    return null;
  }

  const effectiveKey = featureKey || 'FEATURE_LOCKED';
  const meta = FEATURE_METAS[effectiveKey] || {
    name: featureName || (error?.data?.data?.featureDisplayName) || effectiveKey,
    tagline: 'Tính năng cao cấp dành riêng cho gói nâng cao',
    description: 'Vui lòng nâng cấp gói cước để mở khóa và trải nghiệm tính năng này.',
    minPlanName: 'Gói Nâng Cao',
    highlights: ['Trải nghiệm bộ công cụ bán hàng không giới hạn'],
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-cyan-500/30 rounded-3xl text-center space-y-5 my-6 shadow-2xl shadow-cyan-950/40 max-w-2xl mx-auto backdrop-blur-md">
      <div className="relative w-18 h-18 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-xl shadow-cyan-500/20">
        <Gem className="w-9 h-9 animate-pulse text-cyan-300" />
        <Sparkles className="w-4 h-4 text-amber-300 absolute -top-1 -right-1 animate-bounce" />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold uppercase tracking-wider">
          <Gem className="w-3.5 h-3.5" />
          <span>Yêu cầu {meta.minPlanName}</span>
        </div>
        <h3 className="text-2xl font-black text-white pt-1">{meta.name}</h3>
        <p className="text-sm font-semibold text-cyan-200/90">{meta.tagline}</p>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          {meta.description}
        </p>
      </div>

      {/* Highlights */}
      <div className="w-full max-w-md p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left space-y-2">
        {meta.highlights.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => navigate('/subscription')}
        className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white text-sm font-extrabold shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition hover:scale-[1.03] cursor-pointer"
      >
        <span>Nâng Cấp Gói Ngay</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
};
