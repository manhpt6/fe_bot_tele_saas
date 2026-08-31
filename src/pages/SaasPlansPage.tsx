import React, { useState } from 'react';
import {
  useGetSaasPlansAdminQuery,
  useGetFeatureRegistryQuery,
  useCreateSaasPlanMutation,
  useUpdateSaasPlanMutation,
  useDeleteSaasPlanMutation,
  SaasPlan,
} from '../api/saasApi';
import { useSimulation } from '../context/SimulationContext';
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Eye,
  EyeOff,
  Layers,
  Users,
  Clock,
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
  const [deletePlanMutation, { isLoading: isDeleting }] = useDeleteSaasPlanMutation();

  const isLoading = isPlansLoading || isFeaturesLoading;

  const { startSimulation } = useSimulation();

  const [editingPlan, setEditingPlan] = useState<Partial<SaasPlan> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletePlanTarget, setDeletePlanTarget] = useState<SaasPlan | null>(null);

  const handleToggleActive = async (plan: SaasPlan) => {
    try {
      const newStatus = !plan.isActive;
      await updatePlan({ id: plan.id, plan: { ...plan, isActive: newStatus } }).unwrap();
      toast.success(newStatus ? `Đã mở bán lại gói ${plan.name}!` : `Đã xóa mềm (ẩn) gói ${plan.name}!`);
      if (deletePlanTarget) setDeletePlanTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Thao tác thất bại');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletePlanTarget) return;
    try {
      await deletePlanMutation(deletePlanTarget.id).unwrap();
      toast.success(`Đã xóa vĩnh viễn gói ${deletePlanTarget.name}!`);
      setDeletePlanTarget(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể xóa gói cước');
    }
  };

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
                  <div className="grid grid-cols-2 gap-1 mt-1 text-[11px] text-slate-400">
                    {plan.price3Months ? (
                      <div>3T: <span className="text-slate-300 font-medium">{Number(plan.price3Months).toLocaleString('vi-VN')}đ</span></div>
                    ) : null}
                    {plan.price6Months ? (
                      <div>6T: <span className="text-slate-300 font-medium">{Number(plan.price6Months).toLocaleString('vi-VN')}đ</span></div>
                    ) : null}
                  </div>
                  {plan.priceYearly && (
                    <div className="text-xs text-slate-400 mt-0.5">
                      Gói năm: <span className="text-slate-300 font-semibold">{Number(plan.priceYearly).toLocaleString('vi-VN')}đ</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center">
                    <Package className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Tối đa: <strong>{plan.maxProducts === -1 ? 'Vô hạn' : plan.maxProducts}</strong> sản phẩm</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-indigo-400" />
                    <span>Tối đa: <strong>{plan.maxStaff === -1 ? 'Vô hạn' : plan.maxStaff}</strong> nhân viên</span>
                  </div>
                  {plan.slug === 'trial' && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-indigo-400" />
                      <span>Dùng thử: <strong>{plan.trialDays === 0 ? 'Vĩnh viễn' : `${plan.trialDays} ngày`}</strong></span>
                    </div>
                  )}

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

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(plan)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Sửa
                  </button>
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className={`py-2 px-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1 transition ${
                      plan.isActive
                        ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                        : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                    }`}
                    title={plan.isActive ? 'Xóa mềm (Ẩn gói này khỏi bảng giá)' : 'Mở bán lại gói này'}
                  >
                    {plan.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{plan.isActive ? 'Ẩn' : 'Mở'}</span>
                  </button>
                  <button
                    onClick={() => setDeletePlanTarget(plan)}
                    className="py-2 px-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center justify-center transition"
                    title="Xóa vĩnh viễn (Xóa cứng)"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá 1 tháng (VNĐ) *</label>
                  <input
                    type="number"
                    value={editingPlan.priceMonthly === undefined ? '' : editingPlan.priceMonthly}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, priceMonthly: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá 3 tháng (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="Tự động"
                    value={editingPlan.price3Months === undefined ? '' : editingPlan.price3Months}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, price3Months: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá 6 tháng (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="Tự động"
                    value={editingPlan.price6Months === undefined ? '' : editingPlan.price6Months}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, price6Months: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Giá 1 năm (VNĐ)</label>
                  <input
                    type="number"
                    placeholder="Tự động"
                    value={editingPlan.priceYearly === undefined ? '' : editingPlan.priceYearly}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, priceYearly: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Max Sản Phẩm</label>
                    <label className="flex items-center text-[10px] text-slate-400 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        className="mr-1 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500"
                        checked={editingPlan.maxProducts === -1}
                        onChange={(e) =>
                          setEditingPlan((prev) => ({ ...prev, maxProducts: e.target.checked ? -1 : 100 }))
                        }
                      />
                      Vô hạn
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={editingPlan.maxProducts === -1}
                    value={editingPlan.maxProducts === -1 ? '' : (editingPlan.maxProducts ?? '')}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, maxProducts: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    placeholder={editingPlan.maxProducts === -1 ? 'Vô hạn' : 'Nhập số lượng'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">Max Nhân Viên</label>
                    <label className="flex items-center text-[10px] text-slate-400 cursor-pointer hover:text-white transition-colors">
                      <input
                        type="checkbox"
                        className="mr-1 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500"
                        checked={editingPlan.maxStaff === -1}
                        onChange={(e) =>
                          setEditingPlan((prev) => ({ ...prev, maxStaff: e.target.checked ? -1 : 5 }))
                        }
                      />
                      Vô hạn
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={editingPlan.maxStaff === -1}
                    value={editingPlan.maxStaff === -1 ? '' : (editingPlan.maxStaff ?? '')}
                    onChange={(e) =>
                      setEditingPlan((prev) => ({ ...prev, maxStaff: e.target.value === '' ? undefined : Number(e.target.value) }))
                    }
                    placeholder={editingPlan.maxStaff === -1 ? 'Vô hạn' : 'Nhập số lượng'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {editingPlan.slug === 'trial' ? (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">Dùng thử (Ngày)</label>
                      <label className="flex items-center text-[10px] text-slate-400 cursor-pointer hover:text-white transition-colors">
                        <input
                          type="checkbox"
                          className="mr-1 rounded bg-slate-800 border-slate-700 text-indigo-500 focus:ring-indigo-500"
                          checked={editingPlan.trialDays === 0}
                          onChange={(e) =>
                            setEditingPlan((prev) => ({ ...prev, trialDays: e.target.checked ? 0 : 7 }))
                          }
                        />
                        Vĩnh viễn
                      </label>
                    </div>
                    <input
                      type="number"
                      disabled={editingPlan.trialDays === 0}
                      value={editingPlan.trialDays === 0 ? '' : (editingPlan.trialDays ?? '')}
                      onChange={(e) =>
                        setEditingPlan((prev) => ({ ...prev, trialDays: e.target.value === '' ? undefined : Number(e.target.value) }))
                      }
                      placeholder={editingPlan.trialDays === 0 ? 'Vĩnh viễn' : 'Nhập số ngày'}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                ) : (
                  <div></div>
                )}
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

              <div className="p-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    {editingPlan.isActive ? (
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    )}
                    {editingPlan.isActive ? 'Trạng thái: Đang mở bán công khai' : 'Trạng thái: Đã xóa mềm (Ẩn khỏi bảng giá)'}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {editingPlan.isActive
                      ? 'Khách hàng có thể nhìn thấy và mua gói này trên web.'
                      : 'Gói này đã bị ẩn với khách mới, khách cũ vẫn dùng tiếp đến khi hết hạn.'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingPlan((prev) => ({ ...prev, isActive: !prev?.isActive }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                    editingPlan.isActive
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                  }`}
                >
                  {editingPlan.isActive ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" /> Ẩn gói (Xóa mềm)
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" /> Mở bán lại
                    </>
                  )}
                </button>
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

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      {deletePlanTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Trash2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Xác nhận xóa gói cước?</h3>
              <p className="text-xs text-slate-400 mt-1">
                Bạn đang yêu cầu xóa gói: <strong className="text-white">{deletePlanTarget.name}</strong> ({deletePlanTarget.slug})
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/50 border border-slate-700/50 rounded-2xl space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Quy tắc an toàn:</strong> Nếu gói này <em>đã từng có Shop đăng ký hoặc thanh toán</em>, hệ thống sẽ <strong>chặn xóa vĩnh viễn</strong> để bảo toàn số liệu kế toán.
                </span>
              </div>
              <p className="text-[11px] text-slate-400 pl-6">
                Để ngừng bán gói đã có người mua, hãy chọn <strong>Chỉnh sửa</strong> và tắt cờ <strong>"Hiển thị gói cước này công khai" (Xóa mềm)</strong>.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletePlanTarget(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
              >
                Hủy
              </button>
              {deletePlanTarget.isActive && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleToggleActive(deletePlanTarget)}
                  className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/20 flex items-center justify-center gap-1.5 transition"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Xóa mềm (Ẩn gói ngay)
                </button>
              )}
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/20 flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {isDeleting ? 'Đang xóa...' : 'Xóa cứng (Vĩnh viễn)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
