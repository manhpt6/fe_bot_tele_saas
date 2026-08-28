import React, { useState } from 'react';
import {
  useGetSaasPlansAdminQuery,
  useCreateSaasPlanMutation,
  useUpdateSaasPlanMutation,
  SaasPlan,
} from '../api/saasApi';
import {
  Package,
  Plus,
  Edit2,
  Check,
  X,
  Layers,
  Bot,
  Users,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SaasPlansPage = () => {
  const { data: plans, isLoading, refetch } = useGetSaasPlansAdminQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSaasPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSaasPlanMutation();

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
      isActive: true,
      sortOrder: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: SaasPlan) => {
    setEditingPlan({ ...plan });
    setIsModalOpen(true);
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Layers className="w-7 h-7 text-indigo-400" /> Quản Lý Các Gói Cước Cho Thuê (Plans)
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Thiết lập bảng giá, hạn mức sản phẩm và số lượng bot cho từng gói
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition"
        >
          <Plus className="w-4 h-4" /> Thêm Gói Mới
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Đang tải danh sách gói...</div>
        ) : (
          plans?.map((plan) => (
            <div
              key={plan.id}
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
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

                <div className="mt-6 space-y-2 text-xs text-slate-300">
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
              </div>

              <button
                onClick={() => handleOpenEdit(plan)}
                className="mt-6 w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa gói
              </button>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Plan Modal */}
      {isModalOpen && editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Slug (Mã)</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max SP</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Staff</label>
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Bot</label>
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
                <label htmlFor="isActivePlan" className="text-xs font-semibold text-slate-300">
                  Hiển thị gói cước này công khai trên bảng giá
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20"
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
