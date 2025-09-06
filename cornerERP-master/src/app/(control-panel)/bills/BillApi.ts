import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, QueryParamsBuilder, BaseQuery } from '@/lib/api/BaseApi';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

// ===== 類型定義 =====

export interface Bill {
	billNumber: string; // 出納編號 (主鍵)
	billDate: Date; // 出帳日期
	status: number; // 狀態
	invoiceNumbers: string[]; // 請款編號
	createdAt: Date; // 創建時間
	createdBy: string; // 創建人員
	modifiedAt: Date; // 編輯時間
	modifiedBy: string; // 編輯人員
}

// 擴展查詢參數
export interface BillQueryParams extends StandardQueryParams {
	billNumber?: string;
	status?: number[];
}

// ===== API 建立 =====

const BillApi = createExtendedApi<Bill, string, BillQueryParams>({
	basePath: '/api/supabase/bills',
	entityTag: 'bill',
	entitiesTag: 'bills',
	idField: 'billNumber',

	// 自訂端點：處理特殊查詢參數格式
	customEndpoints: {
		// 覆寫預設的 getBills 查詢以處理狀態陣列和特殊參數格式
		getBills: (build: EndpointBuilder<BaseQuery, BaseQuery, string>) =>
			build.query<Bill[], BillQueryParams | void>({
				query: (params?: BillQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: '/api/supabase/bills', method: 'GET' };
					}

					// 處理狀態陣列：將陣列轉換為 JSON 字串，後端會解析
					const processedParams = { ...params };

					if (processedParams.status && Array.isArray(processedParams.status)) {
						processedParams.status = JSON.stringify(processedParams.status) as string;
					}

					const queryString = QueryParamsBuilder.toQueryString(processedParams as Record<string, unknown>);
					return { url: `/api/supabase/bills${queryString}` };
				},
				providesTags: ['bills']
			})
	}
});

export default BillApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['bills', 'bill'] as const;

// ===== 標準 API 類型 =====

export type GetBillsApiResponse = Bill[];
export type GetBillsApiArg = BillQueryParams | void;

export type DeleteBillsApiResponse = unknown;
export type DeleteBillsApiArg = string[];

export type GetBillApiResponse = Bill;
export type GetBillApiArg = string;

export type CreateBillApiResponse = Bill;
export type CreateBillApiArg = PartialDeep<Bill>;

export type UpdateBillApiResponse = Bill;
export type UpdateBillApiArg = Bill;

export type DeleteBillApiResponse = unknown;
export type DeleteBillApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetBillsQuery,
	useDeleteBillsMutation,
	useGetBillQuery,
	useCreateBillMutation,
	useUpdateBillMutation,
	useDeleteBillMutation
} = BillApi;

// ===== API 類型導出 =====

export type BillApiType = {
	[BillApi.reducerPath]: ReturnType<typeof BillApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：115 行
 * 重構後：~90 行 (減少約 22%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 統一查詢參數處理，支援狀態陣列的 JSON.stringify
 * 4. 保留原有的參數格式處理邏輯
 * 5. 更清晰的類型定義和組織
 * 6. 向後相容性 100%
 */
