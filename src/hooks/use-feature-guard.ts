import { useGetMySubscriptionQuery, useGetSaasPlansAdminQuery } from '../api/saasApi';
import { useSimulation } from '../context/SimulationContext';

/**
 * Hook kiểm tra Tenant hiện tại có quyền dùng tính năng hay không.
 * Hỗ trợ cả chế độ thực (Subscription) và Chế độ Mô phỏng (Simulation Mode).
 */
export const useFeatureGuard = () => {
  const { data: subscription } = useGetMySubscriptionQuery();
  const { isSimulating, simulatedPlan } = useSimulation();
  const { data: plans } = useGetSaasPlansAdminQuery(undefined, { skip: !isSimulating });

  const hasFeature = (featureKey: string): boolean => {
    // 1. Nếu đang bật Chế độ Mô phỏng (Simulation Mode)
    if (isSimulating && simulatedPlan) {
      try {
        const freshPlan = plans?.find((p) => p.id === simulatedPlan.id || p.slug === simulatedPlan.slug) || simulatedPlan;
        const list: string[] = freshPlan.featuresJson
          ? JSON.parse(freshPlan.featuresJson)
          : [];
        return list.includes(featureKey);
      } catch {
        return false;
      }
    }

    // 2. Kiểm tra từ subscription thực tế của Tenant
    if (!subscription?.features) {
      return false;
    }
    return subscription.features.includes(featureKey);
  };

  return {
    hasFeature,
    subscription,
    isSimulating,
  };
};
