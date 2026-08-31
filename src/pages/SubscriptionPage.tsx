import { useState, useEffect } from 'react';
import {
  useGetMySubscriptionQuery,
  useGetPublicPlansQuery,
  useGetFeatureRegistryQuery,
  useSubscribePlanMutation,
  useGetMyPaymentsQuery,
  useCancelMyPaymentMutation,
  SaasPlan,
  SaasPayment,
} from '../api/saasApi';
import {
  Zap,
  CheckCircle2,
  Calendar,
  History,
  QrCode,
  Bot,
  Package,
  Users,
  Lock,
  RefreshCw,
  Ban,
  CreditCard,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const SubscriptionPage = () => {
  const { data: sub, isLoading: isSubLoading, refetch: refetchSub } = useGetMySubscriptionQuery();
  const { data: plans, isLoading: isPlansLoading } = useGetPublicPlansQuery();
  const { data: featureRegistry } = useGetFeatureRegistryQuery();
  const [activePaymentModal, setActivePaymentModal] = useState<SaasPayment | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<Record<number, number>>({});
  const [subscribePlan, { isLoading: isSubscribing }] = useSubscribePlanMutation();
  const [cancelMyPayment] = useCancelMyPaymentMutation();

  const { data: payments, isLoading: isPaymentsLoading } = useGetMyPaymentsQuery(undefined, {
    pollingInterval: activePaymentModal ? 3000 : 0,
  });

  const handleCancelPayment = async (paymentId: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn chờ thanh toán này không?')) return;
    try {
      await cancelMyPayment(paymentId).unwrap();
      toast.success('Đã hủy giao dịch thành công!');
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể hủy giao dịch');
    }
  };

  // Tự động đóng Modal QR và thông báo thành công khi đơn hàng chuyển sang trạng thái PAID
  useEffect(() => {
    if (activePaymentModal && payments) {
      const currentPayment = payments.find((p) => p.id === activePaymentModal.id);
      if (currentPayment && currentPayment.status === 'PAID') {
        setActivePaymentModal(null);
        toast.success('🎉 Thanh toán thành công! Gói cước đã được kích hoạt.');
        refetchSub();
      }
    }
  }, [payments, activePaymentModal, refetchSub]);

  const handleSubscribe = async (plan: SaasPlan) => {
    const months = selectedDuration[plan.id] || 1;
    try {
      const payment = await subscribePlan({ planId: plan.id, durationMonths: months }).unwrap();
      if (payment.status === 'PAID') {
        toast.success('Gói cước miễn phí đã được kích hoạt thành công!');
        refetchSub();
      } else {
        setActivePaymentModal(payment);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || 'Không thể tạo yêu cầu thanh toán');
    }
  };

  if (isSubLoading || isPlansLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" /> Gói cước của bạn
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Gói: {sub?.planName || 'Chưa có gói'}
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Trạng thái:{' '}
              <span
                className={`font-semibold ${
                  sub?.status === 'ACTIVE'
                    ? 'text-emerald-400'
                    : sub?.status === 'TRIAL'
                    ? 'text-blue-400'
                    : 'text-rose-400'
                }`}
              >
                {sub?.status === 'ACTIVE'
                  ? 'ĐANG HOẠT ĐỘNG'
                  : sub?.status === 'TRIAL'
                  ? 'DÙNG THỬ (7 NGÀY)'
                  : 'ĐÃ HẾT HẠN'}
              </span>
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-800">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Còn lại
              </div>
              <div className="text-2xl font-black text-indigo-400 mt-1">
                {sub?.daysRemaining || 0} <span className="text-xs font-normal text-slate-400">ngày</span>
              </div>
            </div>
            <div className="text-center px-3">
              <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                <Bot className="w-3.5 h-3.5" /> Trạng thái Bot
              </div>
              <div
                className={`text-sm font-bold mt-2 ${
                  sub?.isBotRunning ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {sub?.isBotRunning ? '🟢 Đang chạy' : '🔴 Tạm dừng'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Section */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Nâng Cấp & Gia Hạn Gói Cước</h2>
          <p className="text-slate-400 text-sm mt-1">
            Chọn gói cước phù hợp với quy mô kinh doanh của bạn để mở khóa tính năng và tăng hạn mức
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans?.map((plan) => {
            const isCurrent = sub?.plan?.id === plan.id;
            const months = selectedDuration[plan.id] || 1;
            const isYearly = months >= 12;
            const totalPrice = isYearly && plan.priceYearly ? plan.priceYearly : plan.priceMonthly * months;
            
            const isFreePlan = (plan.priceMonthly || 0) === 0;

            const isActive = sub?.status === 'ACTIVE' && !!sub.expiresAt && new Date(sub.expiresAt) > new Date();
            const isPaidActive = isActive && (sub.plan?.priceMonthly || 0) > 0;

            const hasPaidBefore = payments?.some((p) => p.status === 'PAID');
            const isTrialDisabled = isFreePlan && hasPaidBefore;

            const currentPrice = sub?.plan?.priceMonthly || 0;
            const isLowerPlan = isPaidActive && !isCurrent && (plan.priceMonthly || 0) < currentPrice;

            const isDisabled = isSubscribing || isTrialDisabled || isLowerPlan;

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900/80 backdrop-blur rounded-2xl p-6 border flex flex-col justify-between transition-all duration-300 ${
                  isCurrent
                    ? 'border-indigo-500/80 shadow-2xl shadow-indigo-500/10 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-[11px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-lg border border-indigo-400/30">
                    Gói Bạn Đang Sử Dụng
                  </div>
                )}

                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>

                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-extrabold text-white">
                      {totalPrice === 0 ? 'Miễn Phí' : `${totalPrice.toLocaleString('vi-VN')}đ`}
                    </span>
                    {totalPrice > 0 && (
                      <span className="ml-1.5 text-xs text-slate-400">/{months === 12 ? 'năm' : `${months} tháng`}</span>
                    )}
                  </div>

                  {/* Duration Selector for Paid Plans */}
                  {plan.priceMonthly > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-1 p-1 bg-slate-800/80 rounded-lg text-xs">
                      {[1, 3, 6, 12].map((m) => (
                        <button
                          key={m}
                          onClick={() =>
                            setSelectedDuration((prev) => ({ ...prev, [plan.id]: m }))
                          }
                          className={`py-1 rounded font-medium transition ${
                            months === m
                              ? 'bg-indigo-600 text-white shadow'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {m === 12 ? '1N' : `${m}T`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Limits */}
                  <div className="mt-6 space-y-2 text-xs text-slate-300 pb-3 border-b border-slate-800">
                    <div className="flex items-center">
                      <Package className="w-4 h-4 mr-2 text-indigo-400 shrink-0" />
                      <span>
                        Tối đa <strong>{plan.maxProducts === -1 ? 'Không giới hạn' : `${plan.maxProducts} sản phẩm`}</strong>
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Users className="w-4 h-4 mr-2 text-indigo-400 shrink-0" />
                      <span>
                        <strong>{plan.maxStaff === -1 ? 'Không giới hạn' : plan.maxStaff}</strong> nhân viên quản trị
                      </span>
                    </div>

                  </div>

                  {/* Feature Matrix dynamic checklist */}
                  <div className="mt-3 space-y-2">
                    {(featureRegistry || []).map((feat) => {
                      let hasFeat = false;
                      try {
                        const list = plan.featuresJson ? JSON.parse(plan.featuresJson) : [];
                        hasFeat = Array.isArray(list) && list.includes(feat.key);
                      } catch {
                        hasFeat = false;
                      }
                      return (
                        <div key={feat.key} className="flex items-center text-xs">
                          {hasFeat ? (
                            <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-400 shrink-0" />
                          ) : (
                            <span className="w-3.5 h-3.5 mr-2 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">—</span>
                          )}
                          <span className={hasFeat ? 'text-slate-300' : 'text-slate-500 line-through'}>
                            {feat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isDisabled}
                  className={`mt-8 w-full py-2.5 px-4 rounded-xl text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? isFreePlan
                        ? 'bg-slate-800/80 text-slate-400 border border-slate-700/60 cursor-default'
                        : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 shadow-lg shadow-emerald-600/10'
                      : isTrialDisabled || isLowerPlan
                      ? 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20'
                  }`}
                >
                  {isCurrent ? (
                    isFreePlan ? (
                      <>Đang sử dụng (Miễn phí)</>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Gia hạn gói này
                      </>
                    )
                  ) : isTrialDisabled ? (
                    <>
                      <Ban className="w-4 h-4 mr-1 text-slate-500" />
                      Đã sử dụng dùng thử
                    </>
                  ) : isLowerPlan ? (
                    <>
                      <Lock className="w-4 h-4 mr-1 text-slate-500" />
                      Gói thấp hơn (Chờ hết hạn)
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 mr-1" />
                      {isPaidActive ? 'Nâng cấp ngay' : isFreePlan ? 'Dùng thử ngay' : 'Đăng ký ngay'}
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment History Section */}
      <div className="bg-slate-900/60 rounded-2xl border border-slate-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Lịch Sử Thanh Toán Gói Cước</h3>
        </div>

        {isPaymentsLoading ? (
          <div className="py-6 text-center text-slate-500 text-sm">Đang tải lịch sử...</div>
        ) : !payments || payments.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-sm">
            Chưa có giao dịch thanh toán gói cước nào.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Mã thanh toán</th>
                  <th className="py-3 px-4">Thời hạn</th>
                  <th className="py-3 px-4">Số tiền</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4">Thời gian</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-slate-300">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">{p.paymentCode}</td>
                    <td className="py-3 px-4">{p.durationMonths} tháng</td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {Number(p.amount).toLocaleString('vi-VN')}đ
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : p.status === 'PENDING'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : 'bg-rose-500/10 text-rose-400'
                        }`}
                      >
                        {p.status === 'PAID' ? 'Đã thanh toán' : p.status === 'PENDING' ? 'Chờ thanh toán' : p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {p.status === 'PENDING' && p.qrData && (
                        <>
                          <button
                            onClick={() => setActivePaymentModal(p)}
                            className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <QrCode className="w-3.5 h-3.5" /> Quét QR
                          </button>
                          <button
                            onClick={() => handleCancelPayment(p.id)}
                            className="px-3 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 text-xs font-semibold inline-flex items-center gap-1"
                          >
                            <Ban className="w-3.5 h-3.5" /> Hủy
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VietQR Payment Modal */}
      {activePaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActivePaymentModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              ✕
            </button>

            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 mb-2">
              <QrCode className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-white">Quét Mã QR Chuyển Khoản</h3>
            <p className="text-xs text-slate-400">
              Hệ thống sẽ tự động kích hoạt bot ngay khi nhận được thanh toán trong vòng 3-5 giây
            </p>

            {activePaymentModal.qrData && (
              <div className="p-3 bg-white rounded-xl inline-block shadow-inner mx-auto">
                <img
                  src={activePaymentModal.qrData}
                  alt="VietQR Code"
                  className="w-56 h-56 object-contain"
                />
              </div>
            )}

            <div className="bg-slate-800/80 p-3 rounded-xl text-left space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Số tiền:</span>
                <span className="font-bold text-white text-sm text-emerald-400">
                  {Number(activePaymentModal.amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nội dung chuyển khoản (bắt buộc):</span>
                <span className="font-mono font-bold text-amber-400">
                  {activePaymentModal.paymentCode}
                </span>
              </div>
            </div>

            <div className="text-xs text-indigo-400 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Hệ thống đang tự động lắng nghe giao dịch chuyển khoản...
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
