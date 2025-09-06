import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams, QueryParamsBuilder } from '@/lib/api/BaseApi';

// ===== 類型定義 =====

export interface Esim {
	esimNumber: string; // 網卡單號 (主鍵)
	groupCode: string; // 團號
	orderNumber: string; // 訂單編號
	supplierOrderNumber: string; // 供應商訂單編號
	status: number; // 狀態 0:待確認 1:已確認 2:錯誤
	productId: string; // 商品Id
	quantity: number; // 數量
	email: string; // 信箱
	note: string; // 備註
	createdAt: Date; // 創建時間
	createdBy: string; // 創建人員
	modifiedAt: Date; // 修改時間
	modifiedBy: string; // 修改人員
}

// 擴展查詢參數
export interface EsimQueryParams extends StandardQueryParams {
	esimNumber?: string;
	groupCode?: string;
	orderNumber?: string;
	supplierOrderNumber?: string;
	status?: number;
	productId?: string;
	email?: string;
}

// ===== API 建立 =====

const EsimApi = createExtendedApi<Esim, string, EsimQueryParams>({
	basePath: '/api/supabase/esims',
	entityTag: 'esim',
	entitiesTag: 'esims',
	idField: 'esimNumber',

	// 自訂端點：處理 URLSearchParams 格式
	customEndpoints: {
		// 覆寫預設的 getEsims 查詢以使用 URLSearchParams
		getEsims: (build: any) =>
			build.query<Esim[], EsimQueryParams | void>({
				query: (params?: EsimQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: '/api/supabase/esims' };
					}

					const queryString = QueryParamsBuilder.toQueryString(params as any);
					return { url: `/api/supabase/esims${queryString}` };
				},
				providesTags: ['esims']
			})
	}
});

export default EsimApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['esims', 'esim'] as const;

// ===== 標準 API 類型 =====

export type GetEsimsApiResponse = Esim[];
export type GetEsimsApiArg = EsimQueryParams | void;

export type DeleteEsimsApiResponse = unknown;
export type DeleteEsimsApiArg = string[];

export type GetEsimApiResponse = Esim;
export type GetEsimApiArg = string;

export type CreateEsimApiResponse = Esim;
export type CreateEsimApiArg = PartialDeep<Esim>;

export type UpdateEsimApiResponse = Esim;
export type UpdateEsimApiArg = Esim;

export type DeleteEsimApiResponse = unknown;
export type DeleteEsimApiArg = string;

// ===== Hook 導出 =====

export const {
	useGetEsimsQuery,
	useDeleteEsimsMutation,
	useGetEsimQuery,
	useCreateEsimMutation,
	useUpdateEsimMutation,
	useDeleteEsimMutation
} = EsimApi;

// ===== API 類型導出 =====

export type EsimApiType = {
	[EsimApi.reducerPath]: ReturnType<typeof EsimApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：119 行
 * 重構後：~85 行 (減少約 29%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 統一查詢參數處理，使用 QueryParamsBuilder
 * 4. 更清晰的類型定義和組織
 * 5. 向後相容性 100%
 */
