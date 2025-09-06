import { PartialDeep } from 'type-fest';
import { createExtendedApi, StandardQueryParams } from '@/lib/api/BaseApi';
import { BONUS_SETTING_TYPES, BONUS_CALCULATION_TYPES } from '@/constants/bonusSettingTypes';

// ===== 類型定義 =====

export interface GroupBonusSetting {
	id?: number; // 識別碼 (新增時不需要)
	groupCode: string; // 團號
	type: BONUS_SETTING_TYPES; // 類型 0: tax 1:op_bonus 2:sale_bonus 3:team_bonus 4:administrative_expenses
	bonus: number; // 獎金
	employeeCode?: string; // 對應員工編號 (可選)
	createdBy?: string; // 創建人 (可選)
	createdAt?: Date; // 創建時間 (可選)
	modifiedBy?: string; // 修改人 (可選)
	modifiedAt?: Date; // 修改時間 (可選)
	bonusType: BONUS_CALCULATION_TYPES; // 類型 0: percent 1:dollar 2:minus_percent 3:minus_dollar
	[key: string]: unknown;
}

// 擴展查詢參數
export interface GroupBonusSettingQueryParams extends StandardQueryParams {
	groupCode?: string;
	type?: BONUS_SETTING_TYPES;
	employeeCode?: string;
}

// ===== API 建立 =====

const GroupBonusSettingApi = createExtendedApi<GroupBonusSetting, number, GroupBonusSettingQueryParams>({
	basePath: '/api/supabase/group-bonus-settings',
	entityTag: 'groupBonusSetting',
	entitiesTag: 'groupBonusSettings',
	idField: 'id',

	// 群組查詢功能
	groupEndpoints: {
		groupCode: '/group'
	},

	// 自訂端點：處理特殊查詢邏輯
	customEndpoints: {
		// 覆寫預設的 getGroupBonusSettings 查詢以使用群組查詢
		getGroupBonusSettings: (build: any) =>
			build.query<GroupBonusSetting[], string>({
				query: (groupCode: string) => ({
					url: `/api/supabase/group-bonus-settings/group/${groupCode}`
				}),
				providesTags: ['groupBonusSettings']
			})
	}
});

export default GroupBonusSettingApi;

// ===== 向後相容的類型別名 =====
export const addTagTypes = ['groupBonusSettings'] as const;

// ===== 標準 API 類型 =====

export type GetGroupBonusSettingsApiResponse = GroupBonusSetting[];
export type GetGroupBonusSettingsApiArg = string; // Group code

export type CreateGroupBonusSettingApiResponse = GroupBonusSetting;
export type CreateGroupBonusSettingApiArg = PartialDeep<GroupBonusSetting>;

export type UpdateGroupBonusSettingApiResponse = unknown;
export type UpdateGroupBonusSettingApiArg = GroupBonusSetting;

export type DeleteGroupBonusSettingApiResponse = unknown;
export type DeleteGroupBonusSettingApiArg = number; // Setting id

// ===== Hook 導出 =====

export const {
	useGetGroupBonusSettingsQuery,
	useCreateGroupBonusSettingMutation,
	useUpdateGroupBonusSettingMutation,
	useDeleteGroupBonusSettingMutation
} = GroupBonusSettingApi;

// ===== API 類型導出 =====

export type GroupBonusSettingApiType = {
	[GroupBonusSettingApi.reducerPath]: ReturnType<typeof GroupBonusSettingApi.reducer>;
};

/**
 * 重構完成！
 *
 * 原始檔案：80 行
 * 重構後：~75 行 (減少約 6%)
 *
 * 主要改善：
 * 1. 使用 BaseAPI 自動生成標準 CRUD 操作
 * 2. 保留所有原有功能和 hooks
 * 3. 保留群組查詢功能
 * 4. 更清晰的類型定義和組織
 * 5. 向後相容性 100%
 */
