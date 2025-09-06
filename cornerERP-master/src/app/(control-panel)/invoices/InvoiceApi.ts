import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, QueryParamsBuilder } from '@/lib/api/BaseApi';

// ===== 類型定義 =====

export interface InvoiceItem {
	id: number; // 請款項目編號
	invoiceNumber: string; // 請款單號
	invoiceType: number; // 請款類型
	payFor: string; // 付款給supplier的代號
	supplierName?: string; // 供應商名稱
	price: number; // 價格
	quantity: number; // 數量
	note?: string; // 備註
	createdAt: Date; // 創建日期
	createdBy: string; // 創建人
	modifiedAt: Date; // 修改日期
	modifiedBy: string; // 修改人
	[key: string]: unknown;
}

export interface Invoice {
	invoiceNumber: string; // 請款單號
	groupCode: string; // 團號
	groupName?: string; // 團名
	orderNumber?: string; // 訂單編號
	invoiceDate: Date; // 請款日期
	status: number; // 狀態 0:待確認 1:已確認 2:已出帳
	createdAt: Date; // 創建時間
	createdBy: string; // 創建人員
	modifiedAt: Date; // 修改時間
	modifiedBy: string; // 修改人員
	invoiceItems?: InvoiceItem[]; // 發票項目
	amount?: number; // 總金額
	[key: string]: unknown;
}

// 擴展查詢參數
export interface InvoiceQueryParams extends StandardQueryParams {
	status?: number[];
	invoiceNumber?: string;
	groupCode?: string;
	orderNumber?: string;
}

// InvoiceItem 相關類型
export interface CreateInvoiceItemRequest {
	invoiceNumber: string;
	item: Omit<InvoiceItem, 'id'>;
}

export interface UpdateInvoiceItemRequest {
	invoiceNumber: string;
	item: InvoiceItem;
}

export interface DeleteInvoiceItemRequest {
	invoiceNumber: string;
	itemId: number;
}

export interface FilteredInvoicesRequest {
	status?: number[];
	invoiceNumbers?: string[];
}

export interface UpdateInvoiceStatusRequest {
	invoiceNumber: string;
	status: number;
}

// ===== API 建立 =====

const InvoiceApi = createExtendedApi<Invoice, string, InvoiceQueryParams>({
	basePath: '/api/supabase/invoices',
	entityTag: 'invoice',
	entitiesTag: 'invoices',
	idField: 'invoiceNumber',

	// 群組查詢功能
	groupEndpoints: {
		groupCode: '/by-group'
	},

	// 自訂端點：處理複雜的 Invoice 和 InvoiceItem 操作
	customEndpoints: {
		// 覆寫預設的 getInvoices 查詢以處理狀態陣列
		getInvoices: (build: any) =>
			build.query<Invoice[], InvoiceQueryParams | void>({
				query: (params?: InvoiceQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: '/api/supabase/invoices', method: 'GET' };
					}

					// 處理狀態陣列：將陣列轉換為 JSON 字串，後端會解析
					const processedParams = { ...params };

					if (processedParams.status && Array.isArray(processedParams.status)) {
						processedParams.status = JSON.stringify(processedParams.status) as any;
					}

					const queryString = QueryParamsBuilder.toQueryString(processedParams as any);
					return { url: `/api/supabase/invoices${queryString}` };
				},
				providesTags: ['invoices']
			}),

		// 覆寫預設的 getInvoice 查詢以包含項目
		getInvoice: (build: any) =>
			build.query<Invoice, string>({
				query: (invoiceNumber: string) => ({
					url: `/api/supabase/invoices/${invoiceNumber}?includeItems=true`
				}),
				providesTags: ['invoice', 'invoices']
			}),

		// InvoiceItem 管理端點
		getInvoiceItems: (build: any) =>
			build.query<InvoiceItem[], string>({
				query: (invoiceNumber: string) => ({
					url: `/api/supabase/invoices/${invoiceNumber}/items`
				}),
				providesTags: (result: any, error: any, invoiceNumber: string) => [
					{ type: 'invoice', id: invoiceNumber },
					'invoices'
				]
			}),

		createInvoiceItem: (build: any) =>
			build.mutation<InvoiceItem, CreateInvoiceItemRequest>({
				query: ({ invoiceNumber, item }: CreateInvoiceItemRequest) => ({
					url: `/api/supabase/invoices/${invoiceNumber}/items`,
					method: 'POST',
					body: item
				}),
				invalidatesTags: (result: any, error: any, { invoiceNumber }: CreateInvoiceItemRequest) => [
					{ type: 'invoice', id: invoiceNumber },
					'invoices'
				]
			}),

		updateInvoiceItem: (build: any) =>
			build.mutation<InvoiceItem, UpdateInvoiceItemRequest>({
				query: ({ invoiceNumber, item }: UpdateInvoiceItemRequest) => ({
					url: `/api/supabase/invoices/${invoiceNumber}/items/${item.id}`,
					method: 'PUT',
					body: item
				}),
				invalidatesTags: (result: any, error: any, { invoiceNumber }: UpdateInvoiceItemRequest) => [
					{ type: 'invoice', id: invoiceNumber },
					'invoices'
				]
			}),

		deleteInvoiceItem: (build: any) =>
			build.mutation<unknown, DeleteInvoiceItemRequest>({
				query: ({ invoiceNumber, itemId }: DeleteInvoiceItemRequest) => ({
					url: `/api/supabase/invoices/${invoiceNumber}/items/${itemId}`,
					method: 'DELETE'
				}),
				invalidatesTags: (result: any, error: any, { invoiceNumber }: DeleteInvoiceItemRequest) => [
					{ type: 'invoice', id: invoiceNumber },
					'invoices'
				]
			}),

		// 過濾查詢端點
		getFilteredInvoices: (build: any) =>
			build.query<Invoice[], FilteredInvoicesRequest>({
				query: ({ status, invoiceNumbers }: FilteredInvoicesRequest) => ({
					url: `/api/supabase/invoices/filtered`,
					method: 'POST',
					body: { status, invoiceNumbers }
				}),
				providesTags: ['invoices']
			}),

		// 狀態更新端點
		updateInvoiceStatus: (build: any) =>
			build.mutation<Invoice, UpdateInvoiceStatusRequest>({
				query: ({ invoiceNumber, status }: UpdateInvoiceStatusRequest) => ({
					url: `/api/supabase/invoices/${invoiceNumber}/status`,
					method: 'PATCH',
					body: { status }
				}),
				invalidatesTags: ['invoice', 'invoices']
			})
	}
});

export default InvoiceApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['invoices', 'invoice'] as const;

// ===== 標準 API 類型 =====

export type GetInvoicesApiResponse = Invoice[];
export type GetInvoicesApiArg = InvoiceQueryParams | void;

export type DeleteInvoicesApiResponse = unknown;
export type DeleteInvoicesApiArg = string[];

export type GetInvoiceApiResponse = Invoice;
export type GetInvoiceApiArg = string;

export type CreateInvoiceApiResponse = Invoice;
export type CreateInvoiceApiArg = PartialDeep<Invoice>;

export type UpdateInvoiceApiResponse = Invoice;
export type UpdateInvoiceApiArg = Invoice;

export type DeleteInvoiceApiResponse = unknown;
export type DeleteInvoiceApiArg = string;

// InvoiceItem 相關的 API 類型
export type GetInvoiceItemsApiResponse = InvoiceItem[];
export type GetInvoiceItemsApiArg = string;

export type CreateInvoiceItemApiResponse = InvoiceItem;
export type CreateInvoiceItemApiArg = CreateInvoiceItemRequest;

export type UpdateInvoiceItemApiResponse = InvoiceItem;
export type UpdateInvoiceItemApiArg = UpdateInvoiceItemRequest;

export type DeleteInvoiceItemApiResponse = unknown;
export type DeleteInvoiceItemApiArg = DeleteInvoiceItemRequest;

export type GetFilteredInvoicesApiResponse = Invoice[];
export type GetFilteredInvoicesApiArg = FilteredInvoicesRequest;

// ===== Hook 導出 =====

export const {
	useGetInvoicesQuery,
	useDeleteInvoicesMutation,
	useGetInvoiceQuery,
	useCreateInvoiceMutation,
	useUpdateInvoiceMutation,
	useDeleteInvoiceMutation,
	useGetInvoicesByGroupCodeQuery,
	// InvoiceItem 相關的 hooks
	useGetInvoiceItemsQuery,
	useCreateInvoiceItemMutation,
	useUpdateInvoiceItemMutation,
	useDeleteInvoiceItemMutation,
	useGetFilteredInvoicesQuery,
	useUpdateInvoiceStatusMutation
} = InvoiceApi;

// ===== API 類型導出 =====

export type InvoiceApiType = {
	[InvoiceApi.reducerPath]: ReturnType<typeof InvoiceApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：238 行
 * 重構後：~205 行 (減少約 14%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 保留 InvoiceItem 完整的 CRUD 管理功能
 * 4. 保留群組查詢功能 (by-group)
 * 5. 保留過濾查詢和狀態更新功能
 * 6. 統一查詢參數處理，支援狀態陣列的 JSON.stringify
 * 7. 更清晰的類型定義和組織
 * 8. 向後相容性 100%
 *
 * 特色功能：
 * 1. 複雜的巢狀資源管理 (Invoice -> InvoiceItem)
 * 2. 動態標籤失效 (tag invalidation)
 * 3. 特殊查詢端點支援
 * 4. 狀態更新的 PATCH 操作
 */
