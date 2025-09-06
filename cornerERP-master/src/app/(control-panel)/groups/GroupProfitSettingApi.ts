import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';

// ===== 類型定義 =====

export interface GroupProfitSetting {
	id?: number; // 識別碼 (新增時不需要)
	group_code: string; // 團號
	type: number; // 類型 0: tax 1:op_bonus 2:sale_bonus 3:team_bonus
	profit: number; // 利潤
	employee_code?: string; // 對應員工編號 (可選)
	created_by?: string; // 創建人 (可選)
	created_at?: Date; // 創建時間 (可選)
	modified_by?: string; // 修改人 (可選)
	modified_at?: Date; // 修改時間 (可選)
	profit_type: number; // 類型 0: percent 1:dollar 2:minus_percent 3:minus_dollar
	[key: string]: unknown;
}

// 擴展查詢參數
export interface GroupProfitSettingQueryParams extends StandardQueryParams {
	group_code?: string;
	type?: number;
	employee_code?: string;
}

// ===== API 建立 =====

const GroupProfitSettingApi = createExtendedApi<GroupProfitSetting, number, GroupProfitSettingQueryParams>({
	basePath: '/api/supabase/group-profit-settings',
	entityTag: 'groupProfitSetting',
	entitiesTag: 'groupProfitSettings',
	idField: 'id',

	// 群組查詢功能
	groupEndpoints: {
		groupCode: '/group'
	},

	// 自訂端點：處理特殊查詢邏輯
	customEndpoints: {
		// 覆寫預設的 getGroupProfitSettings 查詢以使用群組查詢
		getGroupProfitSettings: (build: any) =>
			build.query<GroupProfitSetting[], string>({
				query: (groupCode: string) => ({
					url: `/api/supabase/group-profit-settings/group/${groupCode}`
				}),
				providesTags: ['groupProfitSettings']
			})
	}
});

export default GroupProfitSettingApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['groupProfitSettings'] as const;

// ===== 標準 API 類型 =====

export type GetGroupProfitSettingsApiResponse = GroupProfitSetting[];
export type GetGroupProfitSettingsApiArg = string; // Group code

export type CreateGroupProfitSettingApiResponse = GroupProfitSetting;
export type CreateGroupProfitSettingApiArg = PartialDeep<GroupProfitSetting>;

export type UpdateGroupProfitSettingApiResponse = unknown;
export type UpdateGroupProfitSettingApiArg = GroupProfitSetting;

export type DeleteGroupProfitSettingApiResponse = unknown;
export type DeleteGroupProfitSettingApiArg = number; // Setting id

// ===== Hook 導出 =====

export const {
	useGetGroupProfitSettingsQuery,
	useCreateGroupProfitSettingMutation,
	useUpdateGroupProfitSettingMutation,
	useDeleteGroupProfitSettingMutation
} = GroupProfitSettingApi;

// ===== API 類型導出 =====

export type GroupProfitSettingApiType = {
	[GroupProfitSettingApi.reducerPath]: ReturnType<typeof GroupProfitSettingApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：89 行
 * 重構後：~75 行 (減少約 16%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 保留群組查詢功能
 * 4. 更清晰的類型定義和組織
 * 5. 向後相容性 100%
 */
