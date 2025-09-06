/**
 * 請款項目類型常數
 */
export const INVOICE_ITEM_TYPES = {
	HOTEL: 0, // 飯店
	TRANSPORT: 1, // 交通
	MEAL: 2, // 餐飲
	ACTIVITY: 3, // 活動
	TOUR_PAYMENT: 4, // 出團款
	TOUR_RETURN: 5, // 回團款
	OTHER: 6, // 其他
	INSURANCE: 7, // 保險
	BONUS: 8, // 獎金
	REFUND: 9, // 退預收款
	B2B: 10, // 同業
	ESIM: 11, // ESIM
	EMPLOYEE: 999 // 員工
} as const;

/**
 * 請款項目類型名稱映射
 */
export const INVOICE_ITEM_TYPE_NAMES: Record<number, string> = {
	[INVOICE_ITEM_TYPES.HOTEL]: '飯店',
	[INVOICE_ITEM_TYPES.TRANSPORT]: '交通',
	[INVOICE_ITEM_TYPES.MEAL]: '餐飲',
	[INVOICE_ITEM_TYPES.ACTIVITY]: '活動',
	[INVOICE_ITEM_TYPES.TOUR_PAYMENT]: '出團款',
	[INVOICE_ITEM_TYPES.TOUR_RETURN]: '回團款',
	[INVOICE_ITEM_TYPES.OTHER]: '其他',
	[INVOICE_ITEM_TYPES.INSURANCE]: '保險',
	[INVOICE_ITEM_TYPES.BONUS]: '獎金',
	[INVOICE_ITEM_TYPES.REFUND]: '退預收款',
	[INVOICE_ITEM_TYPES.B2B]: '同業',
	[INVOICE_ITEM_TYPES.ESIM]: '網卡',
	[INVOICE_ITEM_TYPES.EMPLOYEE]: '員工'
};

/**
 * 請款項目類型選項 (用於下拉選單)
 */
export const INVOICE_ITEM_TYPE_OPTIONS = Object.entries(INVOICE_ITEM_TYPE_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據請款項目類型代碼獲取對應的名稱
 * @param type 請款項目類型代碼
 * @returns 請款項目類型名稱
 */
export function getInvoiceItemTypeName(type: number | undefined | null): string {
	if (type === undefined || type === null) {
		return '';
	}

	return INVOICE_ITEM_TYPE_NAMES[type] || `未知類型(${type})`;
}

/**
 * 請款項目類型
 */
export type InvoiceItemType = (typeof INVOICE_ITEM_TYPES)[keyof typeof INVOICE_ITEM_TYPES];
