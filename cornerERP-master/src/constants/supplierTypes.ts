/**
 * 供應商類型常數
 */
export const SUPPLIER_TYPES = {
	HOTEL: 'Hotel', // 飯店
	TRAFFIC: 'Traffic', // 交通
	FOOD: 'Food', // 餐飲
	ACTIVITY: 'Activity', // 活動
	OTHER: 'Other', // 其他
	EMPLOYEE: 'Employee', // 員工
	B2B: 'B2B' // 同業
} as const;

/**
 * 供應商類型名稱映射
 */
export const SUPPLIER_TYPES_NAMES: Record<SupplierType, string> = {
	[SUPPLIER_TYPES.HOTEL]: '飯店',
	[SUPPLIER_TYPES.TRAFFIC]: '交通',
	[SUPPLIER_TYPES.FOOD]: '餐飲',
	[SUPPLIER_TYPES.ACTIVITY]: '活動',
	[SUPPLIER_TYPES.OTHER]: '其他',
	[SUPPLIER_TYPES.EMPLOYEE]: '員工',
	[SUPPLIER_TYPES.B2B]: '同業'
};
/**
 * 供應商類型
 */
export type SupplierType = (typeof SUPPLIER_TYPES)[keyof typeof SUPPLIER_TYPES];

/**
 * 供應商類型選項 (用於下拉選單)
 */
export const SUPPLIER_TYPE_OPTIONS = Object.entries(SUPPLIER_TYPES_NAMES).map(([value, label]) => ({
	value: value,
	label
}));
/**
 * 根據請款項目類型獲取對應的供應商類型列表
 * @param type 請款項目類型
 * @returns 供應商類型列表
 */
export function getSupplierTypesByInvoiceItemType(type: number | null | undefined): SupplierType[] {
	if (type === undefined || type === null) {
		return [SUPPLIER_TYPES.EMPLOYEE];
	}

	switch (type) {
		case 0: // 飯店 (HOTEL)
			return [SUPPLIER_TYPES.HOTEL, SUPPLIER_TYPES.EMPLOYEE, SUPPLIER_TYPES.B2B];
		case 1: // 交通 (TRANSPORT)
			return [SUPPLIER_TYPES.TRAFFIC, SUPPLIER_TYPES.EMPLOYEE, SUPPLIER_TYPES.B2B];
		case 2: // 餐飲 (MEAL)
			return [SUPPLIER_TYPES.FOOD, SUPPLIER_TYPES.EMPLOYEE, SUPPLIER_TYPES.HOTEL, SUPPLIER_TYPES.B2B];
		case 3: // 活動 (ACTIVITY)
			return [SUPPLIER_TYPES.ACTIVITY, SUPPLIER_TYPES.EMPLOYEE, SUPPLIER_TYPES.B2B];
		case 6: // 其他 (OTHER)
			return [SUPPLIER_TYPES.OTHER, SUPPLIER_TYPES.EMPLOYEE, SUPPLIER_TYPES.B2B];
		case 7: // 保險 (INSURANCE)
			return [SUPPLIER_TYPES.OTHER, SUPPLIER_TYPES.EMPLOYEE];
		case 8: // 獎金 (BONUS)
			return [SUPPLIER_TYPES.EMPLOYEE];
		case 9: // 退預收款 (REFUND)
			return [];
		case 999: // 員工 (EMPLOYEE)
			return [SUPPLIER_TYPES.EMPLOYEE];
		case 10: // 同業 (B2B)
			return [SUPPLIER_TYPES.B2B];
		case 11: // 網卡 (ESIM)
			return [SUPPLIER_TYPES.OTHER];
		default:
			return [SUPPLIER_TYPES.EMPLOYEE];
	}
}
