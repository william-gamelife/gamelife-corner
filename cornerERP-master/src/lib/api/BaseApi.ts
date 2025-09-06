import { apiService as api } from 'src/store/apiService';
import { PartialDeep } from 'type-fest';
import type { EndpointBuilder } from '@reduxjs/toolkit/query';

/**
 * 查詢參數的基礎介面
 */
export type BaseQueryParams = Record<string, string | number | boolean | null | undefined | (string | number)[]>;

/**
 * 基礎查詢類型
 */
export type BaseQuery = BaseQueryParams;

/**
 * 標準 CRUD 操作的配置介面
 */
export interface BaseApiConfig<TEntity, TId = string> {
	/** API 端點的基礎路徑 (例如: '/api/supabase/orders') */
	basePath: string;

	/** 實體的單數標籤名稱 (例如: 'order') */
	entityTag: string;

	/** 實體的複數標籤名稱 (例如: 'orders') */
	entitiesTag: string;

	/** 實體的主鍵欄位名稱 (例如: 'orderNumber') */
	idField: keyof TEntity;

	/** 資料模型轉換函數 (可選) */
	modelTransform?: (data: PartialDeep<TEntity>) => unknown;

	/** 自訂端點配置 (可選) */
	customEndpoints?: Record<string, unknown>;
}

/**
 * 標準 API 回應類型
 */
export interface StandardApiTypes<TEntity, TId = string, TQueryParams = BaseQueryParams> {
	// 查詢多筆
	GetEntitiesApiResponse: TEntity[];
	GetEntitiesApiArg: TQueryParams | void;

	// 查詢單筆
	GetEntityApiResponse: TEntity;
	GetEntityApiArg: TId;

	// 建立
	CreateEntityApiResponse: TEntity;
	CreateEntityApiArg: PartialDeep<TEntity>;

	// 更新
	UpdateEntityApiResponse: TEntity | unknown;
	UpdateEntityApiArg: TEntity;

	// 刪除單筆
	DeleteEntityApiResponse: unknown;
	DeleteEntityApiArg: TId;

	// 批量刪除
	DeleteEntitiesApiResponse: unknown;
	DeleteEntitiesApiArg: TId[];
}

/**
 * 查詢參數處理工具
 */
export class QueryParamsBuilder {
	/**
	 * 將物件轉換為 URLSearchParams
	 */
	static toURLSearchParams(params: BaseQueryParams): URLSearchParams {
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value === null || value === undefined) {
				return;
			}

			if (Array.isArray(value)) {
				// 處理陣列值
				value.forEach((val) => {
					if (val !== null && val !== undefined) {
						queryParams.append(key, val.toString());
					}
				});
			} else {
				queryParams.append(key, value.toString());
			}
		});

		return queryParams;
	}

	/**
	 * 將物件轉換為查詢字串
	 */
	static toQueryString(params: BaseQueryParams): string {
		const queryParams = this.toURLSearchParams(params);
		const queryString = queryParams.toString();
		return queryString ? `?${queryString}` : '';
	}

	/**
	 * 處理特殊陣列參數 (使用 JSON.stringify)
	 *
	 * @deprecated 此方法已不再推薦使用。
	 * 對於 smallint 欄位的陣列參數，應該在後端API路由中直接處理，
	 * 而不是在前端將陣列轉換為字串。
	 *
	 * 建議的做法：
	 * 1. 對於支援 JSON.parse 的後端 (如 Bills, Invoices)，在前端明確處理
	 * 2. 對於使用 searchParams.getAll() 的後端 (如 Receipts)，在後端處理 JSON 字串解析
	 */
	static processSpecialArrays(params: BaseQueryParams, arrayFields: string[] = []): BaseQueryParams {
		const processedParams = { ...params };

		arrayFields.forEach((field) => {
			if (processedParams[field] && Array.isArray(processedParams[field])) {
				processedParams[field] = JSON.stringify(processedParams[field]);
			}
		});

		return processedParams;
	}
}

/**
 * 建立標準 CRUD API 的工廠函數
 */
export function createBaseApi<TEntity, TId = string, TQueryParams = BaseQueryParams>(
	config: BaseApiConfig<TEntity, TId>
) {
	const { basePath, entityTag, entitiesTag, idField, modelTransform, customEndpoints = {} } = config;

	const addTagTypes = [entitiesTag, entityTag] as const;

	return api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
		endpoints: (build) => ({
			// 查詢多筆資料
			[`get${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}`]: build.query({
				query: (params?: TQueryParams | void) => {
					if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
						return { url: basePath };
					}

					const queryString = QueryParamsBuilder.toQueryString(params as BaseQueryParams);
					return { url: `${basePath}${queryString}` };
				},
				providesTags: [entitiesTag]
			}),

			// 批量刪除
			[`delete${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}`]: build.mutation({
				query: (ids: TId[]) => ({
					url: basePath,
					method: 'DELETE',
					body: ids
				}),
				invalidatesTags: [entitiesTag]
			}),

			// 查詢單筆資料
			[`get${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.query({
				query: (id: TId) => ({
					url: `${basePath}/${id}`
				}),
				providesTags: [entityTag, entitiesTag]
			}),

			// 建立資料
			[`create${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
				query: (newEntity: PartialDeep<TEntity>) => ({
					url: basePath,
					method: 'POST',
					body: modelTransform ? modelTransform(newEntity) : newEntity
				}),
				invalidatesTags: [entitiesTag, entityTag]
			}),

			// 更新資料
			[`update${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
				query: (entity: TEntity) => ({
					url: `${basePath}/${(entity as Record<string, unknown>)[idField as string]}`,
					method: 'PUT',
					body: entity
				}),
				invalidatesTags: [entityTag, entitiesTag]
			}),

			// 刪除單筆資料
			[`delete${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
				query: (id: TId) => ({
					url: `${basePath}/${id}`,
					method: 'DELETE'
				}),
				invalidatesTags: [entityTag, entitiesTag]
			}),

			// 自訂端點
			...customEndpoints
		}),
		overrideExisting: false
	});
}

/**
 * 產生標準的 hook 名稱
 */
export function generateStandardHooks(entityTag: string, entitiesTag: string) {
	const capitalizedEntity = entityTag.charAt(0).toUpperCase() + entityTag.slice(1);
	const capitalizedEntities = entitiesTag.charAt(0).toUpperCase() + entitiesTag.slice(1);

	return {
		// 查詢 hooks
		useGetEntitiesQuery: `useGet${capitalizedEntities}Query`,
		useGetEntityQuery: `useGet${capitalizedEntity}Query`,

		// 變更 hooks
		useCreateEntityMutation: `useCreate${capitalizedEntity}Mutation`,
		useUpdateEntityMutation: `useUpdate${capitalizedEntity}Mutation`,
		useDeleteEntityMutation: `useDelete${capitalizedEntity}Mutation`,
		useDeleteEntitiesMutation: `useDelete${capitalizedEntities}Mutation`
	};
}

/**
 * 建立 API 類型的輔助函數
 */
export function createApiType<T extends (...args: unknown[]) => unknown>(
	reducerPath: string
): Record<typeof reducerPath, ReturnType<T>> {
	return {} as Record<typeof reducerPath, ReturnType<T>>;
}

/**
 * 預設的查詢參數介面 (適用於大部分情況)
 */
export interface StandardQueryParams extends BaseQueryParams {
	query?: string;
	limit?: number;
	offset?: number;
	dateFrom?: string;
	dateTo?: string;
}

/**
 * 搜尋功能的基礎配置
 */
export interface SearchEndpointConfig {
	path: string;
	transformResponse?: (response: unknown) => unknown;
}

/**
 * 擴展的 API 配置，包含常見的搜尋和分組功能
 */
export interface ExtendedApiConfig<TEntity, TId = string> extends BaseApiConfig<TEntity, TId> {
	/** 搜尋端點配置 */
	searchEndpoint?: SearchEndpointConfig;

	/** 按群組查詢的端點配置 */
	groupEndpoints?: Record<string, string>;

	/** 選擇列表端點配置 */
	selectEndpoint?: {
		path: string;
		responseType?: unknown;
	};
}

/**
 * 建立擴展的 API (包含搜尋、分組等功能)
 */
export function createExtendedApi<TEntity, TId = string, TQueryParams = BaseQueryParams>(
	config: ExtendedApiConfig<TEntity, TId>
) {
	const {
		basePath,
		entityTag,
		entitiesTag,
		idField,
		modelTransform,
		customEndpoints = {},
		searchEndpoint,
		groupEndpoints,
		selectEndpoint
	} = config;

	const addTagTypes = [entitiesTag, entityTag] as const;

	// 合併所有端點 (標準 CRUD + 自訂端點 + 擴展端點)
	const allEndpoints = { ...customEndpoints };

	// 添加搜尋端點
	if (searchEndpoint) {
		const searchMethodName = `search${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}`;
		allEndpoints[searchMethodName] = (build: EndpointBuilder<BaseQuery, BaseQuery, string>) =>
			build.query({
				query: (query: string) => `${basePath}${searchEndpoint.path}?query=${encodeURIComponent(query)}`,
				transformResponse: searchEndpoint.transformResponse,
				providesTags: [entitiesTag]
			});
	}

	// 添加群組查詢端點
	if (groupEndpoints) {
		Object.entries(groupEndpoints).forEach(([fieldName, path]) => {
			const methodName = `get${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}By${fieldName.charAt(0).toUpperCase()}${fieldName.slice(1)}`;
			allEndpoints[methodName] = (build: EndpointBuilder<BaseQuery, BaseQuery, string>) =>
				build.query({
					query: (value: string) => ({
						url: `${basePath}${path}/${value}`
					}),
					providesTags: [entitiesTag]
				});
		});
	}

	// 添加選擇列表端點
	if (selectEndpoint) {
		const selectMethodName = `get${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}ForSelect`;
		allEndpoints[selectMethodName] = (build: EndpointBuilder<BaseQuery, BaseQuery, string>) =>
			build.query({
				query: () => ({
					url: `${basePath}${selectEndpoint.path}`
				}),
				providesTags: [entitiesTag]
			});
	}

	return api.enhanceEndpoints({ addTagTypes }).injectEndpoints({
		endpoints: (build) => {
			// 先創建標準端點
			const standardEndpoints: Record<string, unknown> = {
				// 查詢多筆資料
				[`get${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}`]: build.query({
					query: (params?: TQueryParams | void) => {
						if (!params || (typeof params === 'object' && Object.keys(params).length === 0)) {
							return { url: basePath };
						}

						const queryString = QueryParamsBuilder.toQueryString(params as BaseQueryParams);
						return { url: `${basePath}${queryString}` };
					},
					providesTags: [entitiesTag]
				}),

				// 批量刪除
				[`delete${entitiesTag.charAt(0).toUpperCase()}${entitiesTag.slice(1)}`]: build.mutation({
					query: (ids: TId[]) => ({
						url: basePath,
						method: 'DELETE',
						body: ids
					}),
					invalidatesTags: [entitiesTag]
				}),

				// 查詢單筆資料
				[`get${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.query({
					query: (id: TId) => ({
						url: `${basePath}/${id}`
					}),
					providesTags: [entityTag, entitiesTag]
				}),

				// 建立資料
				[`create${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
					query: (newEntity: PartialDeep<TEntity>) => ({
						url: basePath,
						method: 'POST',
						body: modelTransform ? modelTransform(newEntity) : newEntity
					}),
					invalidatesTags: [entitiesTag, entityTag]
				}),

				// 更新資料
				[`update${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
					query: (entity: TEntity) => ({
						url: `${basePath}/${(entity as Record<string, unknown>)[idField as string]}`,
						method: 'PUT',
						body: entity
					}),
					invalidatesTags: [entityTag, entitiesTag]
				}),

				// 刪除單筆資料
				[`delete${entityTag.charAt(0).toUpperCase()}${entityTag.slice(1)}`]: build.mutation({
					query: (id: TId) => ({
						url: `${basePath}/${id}`,
						method: 'DELETE'
					}),
					invalidatesTags: [entityTag, entitiesTag]
				})
			};

			// 添加自訂端點 (執行函數來生成端點)
			Object.entries(allEndpoints).forEach(([key, endpointFactory]) => {
				if (typeof endpointFactory === 'function') {
					standardEndpoints[key] = endpointFactory(build);
				} else {
					standardEndpoints[key] = endpointFactory;
				}
			});

			return standardEndpoints;
		},
		overrideExisting: false
	});
}
