import React, { useState } from 'react';
import {
  useGetSaasPlansAdminQuery,
  useGetFeatureRegistryQuery,
  useCreateSaasPlanMutation,
  useUpdateSaasPlanMutation,
  SaasPlan,
} from '../api/saasApi';
import { useSimulation } from '../context/SimulationContext';
import {
  Package,
  Plus,
  Edit2,
  Layers,
  Bot,
  Users,
  Gamepad2,
  Sparkles,
  CreditCard,
  Ticket,
  Radio,
  Wallet,
  FileSpreadsheet,
  BarChart3,
  Smile,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Ánh xạ icon cho các tính năng đã biết, có fallback an toàn
const FEATURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  AUTO_SEPAY_WEBHOOK: CreditCard,
  ALLOW_VOUCHERS: Ticket,
  ALLOW_BROADCAST: Radio,
  ALLOW_CUSTOMER_WALLET: Wallet,
  ALLOW_IMPORT_EXCEL: FileSpreadsheet,
  ALLOW_ADVANCED_STATS: BarChart3,
  ALLOW_CUSTOM_EMOJI: Smile,
};
const DEFAULT_FEATURE_ICON = Sparkles;

export const SaasPlansPage = () => {
  const { data: plans, isLoading: isPlansLoading, refetch } = useGetSaasPlansAdminQuery();
  const { data: featureRegistry, isLoading: isFeaturesLoading } = useGetFeatureRegistryQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSaasPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSaasPlanMutation();

  const isLoading = isPlansLoading || isFeaturesLoading;

  const { startSimulation } = useSimulation();

  const [editingPlan, setEditingPlan] = useState<Partial<SaasPlan> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenCreate = () => {
    setEditingPlan({
      name: '',
      slug: '',
      priceMonthly: 99000,
      priceYearly: 990000,
      maxProducts: 20,
      maxStaff: 2,
      maxBots: 1,
      trialDays: 0,
      featuresJson: JSON.stringify(['AUTO_SEPAY_WEBHOOK', 'ALLOW_VOUCHERS', 'ALLOW_CUSTOMER_WALLET']),
      isActive: true,
      sortOrder: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SaasPlan) => {
    let features = plan.featuresJson;
    if (!features) {
      if (plan.slug === 'trial') features = JSON.stringify(['AUTO_SEPAY_WEBHOOK']);
      else if (plan.slug === 'basic') features = JSON.stringify(['AUTO_SEPAY_WEBHOOK', 'ALLOW_VOUCHERS', 'ALLOW_CUSTOMER_WALLET']);
      else if (plan.slug === 'pro') features = JSON.stringify(['AUTO_SEPAY_WEBHOOK', 'ALLOW_VOUCHERS', 'ALLOW_BROADCAST', 'ALLOW_CUSTOMER_WALLET', 'ALLOW_IMPORT_EXCEL']);
      else features = JSON.stringify((featureRegistry || []).map((f) => f.key));
    }
    setEditingPlan({ ...plan, featuresJson: features });
    setIsModalOpen(true);
  };

  const toggleFeature = (featureKey: string) => {
    if (!editingPlan) return;
    try {
      const currentList: string[] = editingPlan.featuresJson ? JSON.parse(editingPlan.featuresJson) : [];
      let updated: string[];
      if (currentList.includes(featureKey)) {
        updated = currentList.filter((k) => k !== featureKey);
      } else {
        updated = [...currentList, featureKey];
      }
      setEditingPlan({ ...editingPlan, featuresJson: JSON.stringify(updated) });
    } catch {
      setEditingPlan({ ...editingPlan, featuresJson: JSON.stringify([featureKey]) });
    }
  };

  const isFeatureEnabled = (featuresJson: string | undefined, key: string): boolean => {
    if (!featuresJson) return false;
    try {
      const list: string[] = JSON.parse(featuresJson);
      return Array.isArray(list) && list.includes(key);
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    try {
      if (editingPlan.id) {
        await updatePlan({ id: editingPlan.id, plan: editingPlan }).unwrap();
        toast.success('Cập nhật gói cước thành công!');
      } else {
        await createPlan(editingPlan).unwrap();
        toast.success('Tạo gói cước mới thành công!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Thao tác thất bại');
    }
  };

  return (
    <div className="space-y-6">
      {/* Clean Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-400" /> Quản Lý Các Gói Cước Cho Thuê
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Cấu hình bảng giá, hạn mức tài nguyên và bấm <strong>"Mô Phỏng Gói Này"</strong> để trải nghiệm trực tiếp như khách hàng
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Thêm Gói Mới
        </button>
      </div>

      {/* Clean Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Đang tải danh sách gói...</div>
        ) : (
          plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition duration-200 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      plan.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {plan.isActive ? 'Đang mở' : 'Đã ẩn'}
                  </span>
                </div>
                <div className="text-xs font-mono text-indigo-400 mt-0.5">slug: {plan.slug}</div>

                <div className="mt-4">
                  <div className="text-2xl font-black text-white">
                    {Number(plan.priceMonthly).toLocaleString('vi-VN')}đ
                    <span className="text-xs font-normal text-slate-400">/tháng</span>
                  </div>
                  {plan.priceYearly && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Gói năm: {Number(plan.priceYearly).toLocaleString('vi-VN')}đ
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Tối đa: <strong>{plan.maxProducts || 'Vô hạn'}</strong> sản phẩm</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Tối đa: <strong>{plan.maxStaff}</strong> nhân viên</span>
                  </div>
                  <div className="flex items-center">
                    <Bot className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Tối đa: <strong>{plan.maxBots}</strong> Bot Telegram</span>
                  </div>
                </div>

                {/* Features Summary */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Tính năng đã bật:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(featureRegistry || []).map((f) => {
                      const hasFeature = isFeatureEnabled(plan.featuresJson, f.key);
                      if (!hasFeature) return null;
                      return (
                        <span
                          key={f.key}
                          className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-medium"
                        >
                          {f.name.split('(')[0]}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-2">
                {/* Simulator Mode Entry */}
                <button
                  onClick={() => startSimulation(plan)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/20 transition"
                  title="Biến toàn bộ giao diện thành Shop dùng gói này"
                >
                  <Gamepad2 className="w-4 h-4" /> Mô Phỏng Gói Này
                </button>

                <button
                  onClick={() => handleOpenEdit(plan)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh Sửa & Cấu Hình Tính Năng
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT PLAN MODAL WITH FEATURE MATRIX                              */}
      {/* ========================================================================= */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              {editingPlan.id ? 'Chỉnh Sửa Gói Cước' : 'Thêm Gói Cước Mới'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tên gói</label>
                  <input
                    type="text"
                    value={editingPlan.name || ''}
                    onChange={(e) => setEditingPlan((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (Mã duy nhất)</label>
                  <input
                    type="text"
                    value={editingPlan.slug || ''}
                    onChange={(e) => setEditingPlan((prev) => ({ ...prev, slug: e.target.value }))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá tháng (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthly ?? 0}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, priceMonthly: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá năm (VNĐ)</label>
                  <input
                    type="number"
                    value={editingPlan.priceYearly ?? 0}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, priceYearly: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Sản Phẩm</label>
                  <input
                    type="number"
                    value={editingPlan.maxProducts ?? 10}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, maxProducts: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Nhân Viên</label>
                  <input
                    type="number"
                    value={editingPlan.maxStaff ?? 1}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, maxStaff: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Bot Tele</label>
                  <input
                    type="number"
                    value={editingPlan.maxBots ?? 1}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, maxBots: Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* FEATURE MATRIX CHECKBOXES */}
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-bold text-indigo-400 uppercase tracking-wider">
                  🎯 Phân Quyền Tính Năng Cho Gói (Feature Matrix)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  {(featureRegistry || []).map((feat) => {
                    const checked = isFeatureEnabled(editingPlan.featuresJson, feat.key);
                    const Icon = FEATURE_ICON_MAP[feat.key] || DEFAULT_FEATURE_ICON;
                    return (
                      <label
                        key={feat.key}
                        onClick={() => toggleFeature(feat.key)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition select-none ${
                          checked
                            ? 'bg-indigo-600/10 border-indigo-500/40 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => {}}
                          className="mt-0.5 rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div>
                          <div className="text-xs font-bold flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-indigo-400" />
                            {feat.name}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{feat.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActivePlan"
                  checked={editingPlan.isActive ?? true}
                  onChange={(e) =>
                    setEditingPlan((prev) => ({ ...prev, isActive: e.target.checked }))
                  }
                  className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="isActivePlan" className="text-xs font-semibold text-slate-300 cursor-pointer">
                  Hiển thị gói cước này công khai trên bảng giá cho khách thuê
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
                >
                  Lưu Gói Cước
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
