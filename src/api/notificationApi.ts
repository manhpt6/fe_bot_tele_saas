import { baseApi } from './baseApi';
import { PageResponse } from '../types/pagination';

export interface AppNotification {
  id: number;
  title: string;
  message: string;
  type: string;
  referenceId: string;
  read: boolean;
  createdAt: string;
}

export interface NotificationQueryParams {
  unreadOnly?: boolean;
  page?: number;
  size?: number;
}

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<PageResponse<AppNotification>, NotificationQueryParams | void>({
      query: (params) => {
        if (!params) return '/admin/notifications';
        const searchParams = new URLSearchParams();
        if (params.unreadOnly) searchParams.append('unreadOnly', 'true');
        if (params.page !== undefined) searchParams.append('page', params.page.toString());
        if (params.size !== undefined) searchParams.append('size', params.size.toString());
        return `/admin/notifications?${searchParams.toString()}`;
      },
      providesTags: ['Notification'],
    }),
    getUnreadCount: builder.query<{ count: number }, void>({
      query: () => '/admin/notifications/unread-count',
      providesTags: ['Notification'],
    }),
    markAsRead: builder.mutation<{ message: string }, number>({
      query: (id) => ({
        url: `/admin/notifications/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllAsRead: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: `/admin/notifications/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const { 
  useGetNotificationsQuery, 
  useGetUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation
} = notificationApi;
