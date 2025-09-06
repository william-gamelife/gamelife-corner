/**
 * 收款方式類型常數
 */
export const RECEIPT_TYPES = {
	BANK_TRANSFER: 0, // 匯款
	CASH: 1, // 現金
	CREDIT_CARD: 2, // 刷卡
	CHECK: 3, // 支票
	LINK_PAY: 4 // LinkPay
} as const;

/**
 * 收款方式類型名稱映射
 */
export const RECEIPT_TYPE_NAMES: Record<number, string> = {
	[RECEIPT_TYPES.BANK_TRANSFER]: '匯款',
	[RECEIPT_TYPES.CASH]: '現金',
	[RECEIPT_TYPES.CREDIT_CARD]: '刷卡',
	[RECEIPT_TYPES.CHECK]: '支票',
	[RECEIPT_TYPES.LINK_PAY]: 'LinkPay'
};

/**
 * 收款方式類型選項 (用於下拉選單)
 */
export const RECEIPT_TYPE_OPTIONS = Object.entries(RECEIPT_TYPE_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據收款方式類型代碼獲取對應的名稱
 * @param type 收款方式類型代碼
 * @returns 收款方式名稱
 */
export function getReceiptTypeName(type: number | undefined | null): string {
	if (type === undefined || type === null) {
		return '';
	}

	return RECEIPT_TYPE_NAMES[type] || `未知類型(${type})`;
}

/**
 * 收款方式類型
 */
export type ReceiptType = (typeof RECEIPT_TYPES)[keyof typeof RECEIPT_TYPES];
