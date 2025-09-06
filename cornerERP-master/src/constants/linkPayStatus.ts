/**
 * LinkPay 狀態常數
 */
export const LINKPAY_STATUS = {
	PENDING: 0, // 待付款
	PAID: 1, // 已付款
	ERROR: 2, // 付款失敗
	EXPIRED: 3 // 已過期
} as const;

export type LinkPayStatus = (typeof LINKPAY_STATUS)[keyof typeof LINKPAY_STATUS];

/**
 * 獲取 LinkPay 狀態名稱
 * @param status 狀態代碼
 * @returns 狀態名稱
 */
export function getLinkPayStatusName(status: number): string {
	switch (status) {
		case LINKPAY_STATUS.PENDING:
			return '待付款';
		case LINKPAY_STATUS.PAID:
			return '已付款';
		case LINKPAY_STATUS.ERROR:
			return '錯誤';
		case LINKPAY_STATUS.EXPIRED:
			return '已過期';
		default:
			return '未知狀態';
	}
}

/**
 * 獲取 LinkPay 狀態顏色
 * @param status 狀態代碼
 * @returns MUI Chip 顏色
 */
export function getLinkPayStatusColor(
	status: number
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' {
	switch (status) {
		case LINKPAY_STATUS.PENDING:
			return 'warning';
		case LINKPAY_STATUS.PAID:
			return 'success';
		case LINKPAY_STATUS.ERROR:
			return 'error';
		case LINKPAY_STATUS.EXPIRED:
			return 'error';
		default:
			return 'default';
	}
}
