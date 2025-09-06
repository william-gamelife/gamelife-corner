import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CalendarEvent, groupToCalendarEvent, customerBirthdayToCalendarEvent } from './models/CalendarEventModel';

// Calendar API - 整合 Groups 和 Customers 資料
export const CalendarApi = createApi({
	reducerPath: 'CalendarApi',
	baseQuery: fetchBaseQuery({
		baseUrl: '/api'
	}),
	tagTypes: ['calendar'],
	endpoints: (builder) => ({
		// 獲取日曆事件（包含旅遊團和客戶生日）
		getCalendarEvents: builder.query<CalendarEvent[], { startDate: string; endDate: string }>({
			async queryFn({ startDate, endDate }, _queryApi, _extraOptions, fetchWithBQ) {
				try {
					// 獲取旅遊團資料
					const groupsResponse = await fetchWithBQ({
						url: `/supabase/groups?dateFrom=${startDate}&dateTo=${endDate}`,
						method: 'GET'
					});

					if (groupsResponse.error) {
						return { error: groupsResponse.error };
					}

					// 獲取客戶資料（包含生日）
					const customersResponse = await fetchWithBQ({
						url: '/supabase/customers',
						method: 'GET'
					});

					if (customersResponse.error) {
						return { error: customersResponse.error };
					}

					const groups = groupsResponse.data as any[];
					const customers = customersResponse.data as any[];

					// 轉換旅遊團為日曆事件
					const groupEvents = groups.map((group) => groupToCalendarEvent(group));

					// 轉換客戶生日為日曆事件
					const year = new Date(startDate).getFullYear();
					const birthdayEvents = customers
						.filter((customer) => customer.birthday)
						.map((customer) => customerBirthdayToCalendarEvent(customer, year));

					// 合併所有事件
					const allEvents = [...groupEvents, ...birthdayEvents];

					return { data: allEvents };
				} catch (error) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			providesTags: ['calendar']
		}),

		// 獲取特定日期的旅遊團
		getGroupsByDate: builder.query<any[], string>({
			query: (date) => ({
				url: `/supabase/groups?departureDate=${date}`,
				method: 'GET'
			}),
			providesTags: ['calendar']
		}),

		// 獲取特定月份的客戶生日
		getCustomerBirthdays: builder.query<any[], { month: number; year: number }>({
			async queryFn({ month, year }, _queryApi, _extraOptions, fetchWithBQ) {
				try {
					const response = await fetchWithBQ({
						url: '/supabase/customers',
						method: 'GET'
					});

					if (response.error) {
						return { error: response.error };
					}

					const customers = response.data as any[];

					// 篩選指定月份有生日的客戶
					const birthdayCustomers = customers.filter((customer) => {
						if (!customer.birthday) return false;

						const birthday = new Date(customer.birthday);
						return birthday.getMonth() === month;
					});

					// 轉換為日曆事件
					const events = birthdayCustomers.map((customer) => customerBirthdayToCalendarEvent(customer, year));

					return { data: events };
				} catch (error) {
					return { error: { status: 'CUSTOM_ERROR', error: String(error) } };
				}
			},
			providesTags: ['calendar']
		})
	})
});

export const { useGetCalendarEventsQuery, useGetGroupsByDateQuery, useGetCustomerBirthdaysQuery } = CalendarApi;
