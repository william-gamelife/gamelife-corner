/**
 * 網卡狀態常數
 */
export const ESIM_STATUSES = {
	UNCONFIRMED: 0, // 待確認
	CONFIRMED: 1, // 已確認
	ERROR: 2 // 錯誤
} as const;

/**
 * 網卡狀態名稱映射
 */
export const ESIM_STATUS_NAMES: Record<number, string> = {
	[ESIM_STATUSES.UNCONFIRMED]: '待確認',
	[ESIM_STATUSES.CONFIRMED]: '已確認',
	[ESIM_STATUSES.ERROR]: '錯誤'
};

/**
 * 網卡狀態選項 (用於下拉選單)
 */
export const ESIM_STATUS_OPTIONS = Object.entries(ESIM_STATUS_NAMES).map(([value, label]) => ({
	value: Number(value),
	label
}));

/**
 * 根據網卡狀態代碼獲取對應的名稱
 * @param status 網卡狀態代碼
 * @returns 網卡狀態名稱
 */
export function getEsimStatusName(status: number | undefined | null): string {
	if (status === undefined || status === null) {
		return '';
	}

	return ESIM_STATUS_NAMES[status] || `未知狀態(${status})`;
}

/**
 * 網卡狀態顏色映射
 */
export const ESIM_STATUS_COLORS: Record<
	number,
	'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
	[ESIM_STATUSES.UNCONFIRMED]: 'warning', // 待確認 - 黃色警告色
	[ESIM_STATUSES.CONFIRMED]: 'success', // 已確認 - 綠色成功色
	[ESIM_STATUSES.ERROR]: 'error' // 異常 - 紅色錯誤色
};
/**
 * 網卡狀態類型
 */
export type EsimStatus = (typeof ESIM_STATUSES)[keyof typeof ESIM_STATUSES];
