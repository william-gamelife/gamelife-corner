/**
 * 請款單狀態常數
 */
export const INVOICE_STATUS = {
	PENDING: 0, // 待確認
	CONFIRMED: 1, // 已確認
	BILLED: 2 // 已出帳
} as const;

/**
 * 請款單狀態名稱映射
 */
export const INVOICE_STATUS_NAMES: Record<number, string> = {
	[INVOICE_STATUS.PENDING]: '待確認',
	[INVOICE_STATUS.CONFIRMED]: '已確認',
	[INVOICE_STATUS.BILLED]: '已出帳'
};

/**
 * 請款單狀態選項 (用於下拉選單)
 */
export const INVOICE_STATUS_OPTIONS = Object.entries(INVOICE_STATUS_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據請款單狀態代碼獲取對應的名稱
 * @param status 請款單狀態代碼
 * @returns 請款單狀態名稱
 */
export function getInvoiceStatusName(status: number | undefined | null): string {
	if (status === undefined || status === null) {
		return '';
	}

	return INVOICE_STATUS_NAMES[status] || `未知狀態(${status})`;
}

/**
 * 請款單狀態類型
 */
export type InvoiceStatus = (typeof INVOICE_STATUS)[keyof typeof INVOICE_STATUS];

/**
 * 請款單狀態顏色映射
 */
export const INVOICE_STATUS_COLORS: Record<number, string> = {
	[INVOICE_STATUS.PENDING]: 'warning.main', // 待確認 - 黃色警告色
	[INVOICE_STATUS.CONFIRMED]: 'info.main', // 已確認 - 藍色資訊色
	[INVOICE_STATUS.BILLED]: 'success.main' // 已出帳 - 綠色成功色
};

/**
 * 根據請款單狀態代碼獲取對應的顏色
 * @param status 請款單狀態代碼
 * @returns 請款單狀態顏色
 */
export function getInvoiceStatusColor(status: number | undefined | null): string {
	if (status === undefined || status === null) {
		return '';
	}

	return INVOICE_STATUS_COLORS[status] || 'text.disabled';
}
