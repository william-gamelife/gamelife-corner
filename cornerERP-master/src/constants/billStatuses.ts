/**
 * 出納單狀態常數
 */
export const BILL_STATUSES = {
	CONFIRMED: 1, // 已確認
	PAID: 2 // 已出帳
} as const;

/**
 * 出納單狀態名稱映射
 */
export const BILL_STATUS_NAMES: Record<number, string> = {
	[BILL_STATUSES.CONFIRMED]: '已確認',
	[BILL_STATUSES.PAID]: '已出帳'
};

/**
 * 出納單狀態選項 (用於下拉選單)
 */
export const BILL_STATUS_OPTIONS = Object.entries(BILL_STATUS_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據出納單狀態代碼獲取對應的名稱
 * @param status 出納單狀態代碼
 * @returns 出納單狀態名稱
 */
export function getBillStatusName(status: number | undefined | null): string {
	if (status === undefined || status === null) {
		return '';
	}

	return BILL_STATUS_NAMES[status] || `未知狀態(${status})`;
}

/**
 * 出納單狀態類型
 */
export type BillStatus = (typeof BILL_STATUSES)[keyof typeof BILL_STATUSES];
