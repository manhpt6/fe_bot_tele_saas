import { baseApi } from './baseApi';
import { OrderTable } from '../types';
import { PageResponse } from '../types/pagination';

export interface OrderQueryParams {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
}

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query<PageResponse<OrderTable>, OrderQueryParams | void>({
      query: (params) => {
        if (!params) return '/admin/orders';
        const searchParams = new URLSearchParams();
        if (params.keyword) searchParams.append('keyword', params.keyword);
        if (params.status) searchParams.append('status', params.status);
        if (params.page !== undefined) searchParams.append('page', params.page.toString());
        if (params.size !== undefined) searchParams.append('size', params.size.toString());
        return `/admin/orders?${searchParams.toString()}`;
      },
      providesTags: ['Order'],
    }),
    confirmOrder: builder.mutation<any, string>({
      query: (orderCode) => ({
        url: `/admin/orders/${orderCode}/confirm`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order', 'Product'], // Confirmed order might affect stock
    }),
  }),
});

export const { useGetOrdersQuery, useConfirmOrderMutation } = orderApi;
