import { baseApi } from './baseApi';
import { PaymentConfig } from '../types';

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPaymentConfigs: builder.query<PaymentConfig[], void>({
      query: () => '/admin/payment-configs',
      providesTags: ['PaymentConfig'],
    }),
    createPaymentConfig: builder.mutation<PaymentConfig, Partial<PaymentConfig>>({
      query: (body) => ({
        url: '/admin/payment-configs',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['PaymentConfig'],
    }),
  }),
});

export const { useGetPaymentConfigsQuery, useCreatePaymentConfigMutation } = paymentApi;
