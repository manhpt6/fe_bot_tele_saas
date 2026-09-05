import { baseApi } from './baseApi';
import { PageResponse } from '../types/pagination';

export interface PaymentWebhookEvent {
  id: number;
  provider: string;
  providerTransactionId: string;
  referenceCode?: string;
  amount: number;
  status: string; // UNRESOLVED, AUTO_RESOLVED, MANUALLY_RESOLVED, PROCESSED
  errorCode?: string;
  rawContent?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  createdAt: string;
}

export interface PaymentEventQueryParams {
  status?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export const paymentEventApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentEvents: builder.query<PageResponse<PaymentWebhookEvent>, PaymentEventQueryParams | void>({
      query: (params) => {
        if (!params) return '/admin/payment-events';
        const searchParams = new URLSearchParams();
        if (params.status && params.status !== 'ALL') searchParams.append('status', params.status);
        if (params.keyword) searchParams.append('keyword', params.keyword);
        if (params.page !== undefined) searchParams.append('page', params.page.toString());
        if (params.size !== undefined) searchParams.append('size', params.size.toString());
        const qs = searchParams.toString();
        return qs ? `/admin/payment-events?${qs}` : '/admin/payment-events';
      },
      providesTags: ['PaymentEvent' as any],
    }),
    creditWalletFromEvent: builder.mutation<PaymentWebhookEvent, { id: number; telegramId: number; note?: string }>({
      query: ({ id, telegramId, note }) => ({
        url: `/admin/payment-events/${id}/credit-wallet`,
        method: 'POST',
        body: { telegramId, note },
      }),
      invalidatesTags: ['PaymentEvent' as any, 'Customer', 'Order'],
    }),
    linkOrderFromEvent: builder.mutation<PaymentWebhookEvent, { id: number; orderCode: string; note?: string }>({
      query: ({ id, orderCode, note }) => ({
        url: `/admin/payment-events/${id}/link-order`,
        method: 'POST',
        body: { orderCode, note },
      }),
      invalidatesTags: ['PaymentEvent' as any, 'Order', 'Customer', 'Product'],
    }),
  }),
});

export const {
  useGetPaymentEventsQuery,
  useCreditWalletFromEventMutation,
  useLinkOrderFromEventMutation,
} = paymentEventApi;
