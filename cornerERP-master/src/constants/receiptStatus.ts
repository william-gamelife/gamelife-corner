/**
 * 收據狀態常數
 */
export const RECEIPT_STATUS = {
	PENDING: 0, // 待確認
	CONFIRMED: 1, // 已確認
	ABNORMAL: 2 // 付款異常
} as const;

/**
 * 收據狀態名稱映射
 */
export const RECEIPT_STATUS_NAMES: Record<number, string> = {
	[RECEIPT_STATUS.PENDING]: '待確認',
	[RECEIPT_STATUS.CONFIRMED]: '已確認',
	[RECEIPT_STATUS.ABNORMAL]: '付款異常'
};

/**
 * 收據狀態選項 (用於下拉選單)
 */
export const RECEIPT_STATUS_OPTIONS = Object.entries(RECEIPT_STATUS_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據收據狀態代碼獲取對應的名稱
 * @param status 收據狀態代碼
 * @returns 收據狀態名稱
 */
export function getReceiptStatusName(status: number | undefined | null): string {
	if (status === undefined || status === null) {
		return '';
	}

	return RECEIPT_STATUS_NAMES[status] || `未知狀態(${status})`;
}

/**
 * 收據狀態類型
 */
export type ReceiptStatus = (typeof RECEIPT_STATUS)[keyof typeof RECEIPT_STATUS];

/**
 * 收據狀態顏色映射
 */
export const RECEIPT_STATUS_COLORS: Record<
	number,
	'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
	[RECEIPT_STATUS.PENDING]: 'warning', // 待確認 - 黃色警告色
	[RECEIPT_STATUS.CONFIRMED]: 'success', // 已確認 - 綠色成功色
	[RECEIPT_STATUS.ABNORMAL]: 'error' // 付款異常 - 紅色錯誤色
};

/**
 * 根據收據狀態代碼獲取對應的顏色
 * @param status 收據狀態代碼
 * @returns 收據狀態顏色
 */
export function getReceiptStatusColor(
	status: number | undefined | null
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
	if (status === undefined || status === null) {
		return 'default';
	}

	return RECEIPT_STATUS_COLORS[status] || 'default';
}
