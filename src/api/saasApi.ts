import { baseApi } from './baseApi';

export interface FeatureDefinition {
  key: string;
  name: string;
  description: string;
}

export interface SaasPlan {
  id: number;
  name: string;
  slug: string;
  priceMonthly: number;
  priceYearly?: number;
  maxProducts: number;
  maxOrdersPerMonth?: number;
  maxStaff: number;
  maxBots: number;
  featuresJson?: string;
  trialDays: number;
  isActive: boolean;
  sortOrder: number;
}

export interface SaasSubscriptionDto {
  id: number;
  tenantId: number;
  planId: number;
  planName: string;
  planSlug: string;
  status: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  startedAt: string;
  expiresAt: string;
  daysRemaining: number;
  isBotRunning: boolean;
  plan?: SaasPlan;
  features?: string[];
}

export interface SaasPayment {
  id: number;
  paymentCode: string;
  tenantId: number;
  planId: number;
  durationMonths: number;
  amount: number;
  receivedAmount?: number;
  notes?: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'EXPIRED' | 'CANCELLED';
  paymentMethod: string;
  qrData?: string;
  paidAt?: string;
  createdAt: string;
}

export interface SaasTenantSummary {
  id: number;
  tenantCode: string;
  shopName: string;
  ownerUsername: string;
  ownerEmail?: string;
  ownerPhone?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  maxProducts: number;
  currentProductsCount: number;
  currentPlan?: SaasPlan;
  subscriptionStatus: 'TRIAL' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
  subscriptionExpiresAt?: string;
  daysRemaining: number;
  botUsername?: string;
  isBotRunning: boolean;
  createdAt: string;
}

export interface SaasRevenueSummary {
  totalRevenue: number;
  thisMonthRevenue: number;
  totalTenants: number;
  activeTenants: number;
  runningBots: number;
  monthlyRevenueChart: Array<{ month: string; revenue: number }>;
}

export interface SaasPlatformConfig {
  id?: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankCode?: string;
  webhookProvider: string;
  webhookApiKey?: string;
  isActive: boolean;
  adminPassword?: string;
}

export interface SaasTenantMetrics {
  currentProducts: number;
  maxProducts: number | null;
  currentStaff: number;
  maxStaff: number | null;
  currentOrdersThisMonth: number;
  maxOrdersPerMonth: number | null;
  totalCustomers: number;
}

export interface SaasPaymentRecord {
  id: number;
  paymentCode: string;
  planName: string;
  durationMonths: number;
  amount: number;
  receivedAmount?: number;
  notes?: string;
  status: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED' | 'EXPIRED' | 'CANCELLED';
  paidAt?: string;
  createdAt: string;
}

export const saasApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublicPlans: builder.query<SaasPlan[], void>({
      query: () => '/saas/plans',
      providesTags: ['SaasPlan'],
    }),

    getFeatureRegistry: builder.query<FeatureDefinition[], void>({
      query: () => '/saas/plans/features',
      providesTags: ['SaasPlan'],
    }),

    getMySubscription: builder.query<SaasSubscriptionDto, void>({
      query: () => '/saas/my-subscription',
      providesTags: ['SaasSubscription'],
    }),

    subscribePlan: builder.mutation<SaasPayment, { planId: number; durationMonths: number }>({
      query: (body) => ({
        url: '/saas/subscribe',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SaasSubscription', 'SaasPayment'],
    }),

    getMyPayments: builder.query<SaasPayment[], void>({
      query: () => '/saas/payments',
      providesTags: ['SaasPayment'],
    }),

    registerTenant: builder.mutation<any, any>({
      query: (body) => ({
        url: '/auth/register-tenant',
        method: 'POST',
        body,
      }),
    }),

    // Super Admin endpoints
    getSaasTenants: builder.query<SaasTenantSummary[], void>({
      query: () => '/admin/saas/tenants',
      providesTags: ['SaasTenant'],
    }),

    updateTenantStatus: builder.mutation<any, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/admin/saas/tenants/${id}/status?status=${status}`,
        method: 'PUT',
      }),
      invalidatesTags: ['SaasTenant'],
    }),

    extendTenantSubscription: builder.mutation<any, { id: number; planId: number; months: number; adminPassword: string }>({
      query: ({ id, planId, months, adminPassword }) => ({
        url: `/admin/saas/tenants/${id}/extend?planId=${planId}&months=${months}&adminPassword=${encodeURIComponent(adminPassword)}`,
        method: 'POST',
      }),
      invalidatesTags: ['SaasTenant'],
    }),

    getSaasPlansAdmin: builder.query<SaasPlan[], void>({
      query: () => '/admin/saas/plans',
      providesTags: ['SaasPlan'],
    }),

    createSaasPlan: builder.mutation<SaasPlan, Partial<SaasPlan>>({
      query: (body) => ({
        url: '/admin/saas/plans',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SaasPlan'],
    }),

    updateSaasPlan: builder.mutation<SaasPlan, { id: number; plan: Partial<SaasPlan> }>({
      query: ({ id, plan }) => ({
        url: `/admin/saas/plans/${id}`,
        method: 'PUT',
        body: plan,
      }),
      invalidatesTags: ['SaasPlan'],
    }),

    deleteSaasPlan: builder.mutation<void, number>({
      query: (id) => ({
        url: `/admin/saas/plans/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SaasPlan'],
    }),

    getSaasRevenue: builder.query<SaasRevenueSummary, void>({
      query: () => '/admin/saas/revenue',
      providesTags: ['SaasPayment'],
    }),

    getPlatformConfig: builder.query<SaasPlatformConfig, void>({
      query: () => '/admin/saas/platform-config',
      providesTags: ['SaasPlatformConfig'],
    }),

    savePlatformConfig: builder.mutation<SaasPlatformConfig, Partial<SaasPlatformConfig>>({
      query: (body) => ({
        url: '/admin/saas/platform-config',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['SaasPlatformConfig'],
    }),

    getTenantMetrics: builder.query<SaasTenantMetrics, number>({
      query: (tenantId) => `/admin/saas/tenants/${tenantId}/metrics`,
      providesTags: (_result, _error, id) => [{ type: 'SaasTenant', id }],
    }),

    getTenantPayments: builder.query<SaasPaymentRecord[], number>({
      query: (tenantId) => `/admin/saas/tenants/${tenantId}/payments`,
      providesTags: (_result, _error, id) => [{ type: 'SaasPayment', id }],
    }),

    refundTenantPayment: builder.mutation<SaasPaymentRecord, { paymentId: number; reason?: string }>({
      query: ({ paymentId, reason }) => ({
        url: `/admin/saas/payments/${paymentId}/refund${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`,
        method: 'POST',
      }),
      invalidatesTags: ['SaasPayment', 'SaasRevenue' as any],
    }),
  }),
});

export const {
  useGetPublicPlansQuery,
  useGetFeatureRegistryQuery,
  useGetMySubscriptionQuery,
  useSubscribePlanMutation,
  useGetMyPaymentsQuery,
  useRegisterTenantMutation,
  useGetSaasTenantsQuery,
  useUpdateTenantStatusMutation,
  useExtendTenantSubscriptionMutation,
  useGetSaasPlansAdminQuery,
  useCreateSaasPlanMutation,
  useUpdateSaasPlanMutation,
  useDeleteSaasPlanMutation,
  useGetSaasRevenueQuery,
  useGetPlatformConfigQuery,
  useSavePlatformConfigMutation,
  useGetTenantMetricsQuery,
  useGetTenantPaymentsQuery,
  useRefundTenantPaymentMutation,
} = saasApi;

