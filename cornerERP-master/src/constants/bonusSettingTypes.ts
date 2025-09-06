// 獎金設置類型常量
export const BONUS_SETTING_TYPES = {
	PROFIT_TAX: 0,
	OP_BONUS: 1,
	SALE_BONUS: 2,
	TEAM_BONUS: 3,
	ADMINISTRATIVE_EXPENSES: 4
} as const;

export type BonusSettingType = (typeof BONUS_SETTING_TYPES)[keyof typeof BONUS_SETTING_TYPES];

// 獎金設置類型排序映射
export const BONUS_SETTING_TYPE_SORT_ORDER: Record<BonusSettingType, number> = {
	[BONUS_SETTING_TYPES.PROFIT_TAX]: 1,
	[BONUS_SETTING_TYPES.OP_BONUS]: 3,
	[BONUS_SETTING_TYPES.SALE_BONUS]: 2,
	[BONUS_SETTING_TYPES.TEAM_BONUS]: 4,
	[BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES]: 0
};

// 獎金設置類型名稱映射
export const BONUS_SETTING_TYPE_NAMES: Record<BonusSettingType, string> = {
	[BONUS_SETTING_TYPES.PROFIT_TAX]: '營收稅額',
	[BONUS_SETTING_TYPES.OP_BONUS]: 'OP獎金',
	[BONUS_SETTING_TYPES.SALE_BONUS]: '業務獎金',
	[BONUS_SETTING_TYPES.TEAM_BONUS]: '團隊獎金',
	[BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES]: '行政費用'
};

// 獎金設置類型顏色映射
export const BONUS_SETTING_TYPE_COLORS: Record<BonusSettingType, string> = {
	[BONUS_SETTING_TYPES.PROFIT_TAX]: 'primary',
	[BONUS_SETTING_TYPES.OP_BONUS]: 'secondary',
	[BONUS_SETTING_TYPES.SALE_BONUS]: 'success',
	[BONUS_SETTING_TYPES.TEAM_BONUS]: 'info',
	[BONUS_SETTING_TYPES.ADMINISTRATIVE_EXPENSES]: 'warning'
};

// 獎金設置類型選項
export const BONUS_SETTING_TYPE_OPTIONS = Object.entries(BONUS_SETTING_TYPES).map(([_key, value]) => ({
	value,
	label: BONUS_SETTING_TYPE_NAMES[value as BonusSettingType]
}));

// 獎金計算類型常量
export const BONUS_CALCULATION_TYPES = {
	PERCENT: 0,
	FIXED_AMOUNT: 1,
	MINUS_PERCENT: 2,
	MINUS_FIXED_AMOUNT: 3
} as const;

export type BonusCalculationType = (typeof BONUS_CALCULATION_TYPES)[keyof typeof BONUS_CALCULATION_TYPES];

// 獎金計算類型名稱映射
export const BONUS_CALCULATION_TYPE_NAMES: Record<BonusCalculationType, string> = {
	[BONUS_CALCULATION_TYPES.PERCENT]: '百分比',
	[BONUS_CALCULATION_TYPES.FIXED_AMOUNT]: '固定金額',
	[BONUS_CALCULATION_TYPES.MINUS_PERCENT]: '負百分比',
	[BONUS_CALCULATION_TYPES.MINUS_FIXED_AMOUNT]: '負固定金額'
};

// 獎金計算類型選項
export const BONUS_CALCULATION_TYPE_OPTIONS = Object.entries(BONUS_CALCULATION_TYPES).map(([_key, value]) => ({
	value,
	label: BONUS_CALCULATION_TYPE_NAMES[value as BonusCalculationType]
}));
