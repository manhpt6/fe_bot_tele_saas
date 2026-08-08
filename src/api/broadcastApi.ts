import { baseApi } from './baseApi';

export interface BroadcastRequest {
  message: string;
  imageUrl?: string;
}

export interface BroadcastResponse {
  message: string;
}

export const broadcastApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    sendBroadcast: builder.mutation<BroadcastResponse, BroadcastRequest>({
      query: (data) => ({
        url: '/admin/broadcast',
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const { useSendBroadcastMutation } = broadcastApi;
