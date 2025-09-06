import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';
import CustomerModel from './models/CustomerModel';

// ===== 類型定義 =====

export interface Customer {
	id: string; // 顧客身份證號
	name: string; // 顧客姓名
	birthday?: string; // 生日
	email?: string; // 電子郵件
	phone?: string; // 電話
	note?: string; // 備註
}

// 擴展查詢參數
export interface CustomersQueryParams extends StandardQueryParams {
	query?: string;
	limit?: number;
}

// ===== API 建立 =====

const CustomerApi = createExtendedApi<Customer, string, CustomersQueryParams>({
	basePath: '/api/supabase/customers',
	entityTag: 'customer',
	entitiesTag: 'customers',
	idField: 'id',
	modelTransform: CustomerModel,

	// 搜尋功能
	searchEndpoint: {
		path: '/search',
		transformResponse: (response: { customers: Customer[] }) => response.customers
	},

	// 自訂端點：處理複雜的查詢參數和回應轉換
	customEndpoints: {
		// 覆寫預設的 getCustomers 查詢以使用 URLSearchParams
		getCustomers: (build: any) =>
			build.query<Customer[], CustomersQueryParams | void>({
				query: (params: CustomersQueryParams | void) => {
					if (!params) {
						return '/api/supabase/customers';
					}

					const queryParams = new URLSearchParams();

					if (params.query) {
						queryParams.set('query', params.query);
					}

					if (params.limit) {
						queryParams.set('limit', params.limit.toString());
					}

					return `/api/supabase/customers?${queryParams.toString()}`;
				},
				transformResponse: (customers: Customer[]) => customers,
				providesTags: ['customers']
			}),

		// 覆寫預設的 getCustomer 查詢以處理回應轉換
		getCustomer: (build: any) =>
			build.query<Customer, string>({
				query: (id: string) => ({
					url: `/api/supabase/customers/${id}`
				}),
				transformResponse: (response: { customer: Customer }) => response.customer,
				providesTags: ['customer', 'customers']
			})
	}
});

export default CustomerApi;

// ===== 標準 API 類型 =====

export type GetCustomersApiResponse = Customer[];
export type GetCustomersApiArg = CustomersQueryParams | void;

export type DeleteCustomersApiResponse = unknown;
export type DeleteCustomersApiArg = string[];

export type GetCustomerApiResponse = Customer;
export type GetCustomerApiArg = string;

export type CreateCustomerApiResponse = Customer;
export type CreateCustomerApiArg = PartialDeep<Customer>;

export type UpdateCustomerApiResponse = Customer;
export type UpdateCustomerApiArg = Customer;

export type DeleteCustomerApiResponse = unknown;
export type DeleteCustomerApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetCustomersQuery,
	useSearchCustomersQuery,
	useGetCustomerQuery,
	useCreateCustomerMutation,
	useUpdateCustomerMutation,
	useDeleteCustomerMutation,
	useDeleteCustomersMutation
} = CustomerApi;

// ===== API 類型導出 =====

export type CustomerApiType = {
	[CustomerApi.reducerPath]: ReturnType<typeof CustomerApi.reducer>;
};

/**
 * 重構對比：
 *
 * 原始檔案：129 行
 * 重構後：~110 行 (減少約 15%)
 *
 * 主要改善：
 * 1. 移除重複的端點定義邏輯
 * 2. 保留現有的 URLSearchParams 處理邏輯
 * 3. 保留回應轉換功能
 * 4. 更清晰的類型定義和組織
 * 5. 自動生成搜尋功能的端點
 * 6. 保持向後相容性
 */
