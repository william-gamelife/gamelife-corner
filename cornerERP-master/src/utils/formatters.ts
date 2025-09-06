/**
 * 格式化工具函數
 */

/**
 * 格式化日期輸入
 * @param value 輸入的日期字串
 * @returns 格式化後的日期字串 (yyyy-MM-dd)
 */
export function formatDateInput(value: string): string {
	if (!value) return '';

	// 如果已經是正確的 yyyy-MM-dd 格式，直接返回
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
		return value;
	}

	// 移除所有非數字字符
	const cleaned = value.replace(/\D/g, '');

	// 如果是8位數字(yyyyMMdd)，轉換為yyyy-MM-dd
	if (cleaned.length === 8) {
		const year = cleaned.slice(0, 4);
		const month = cleaned.slice(4, 6);
		const day = cleaned.slice(6, 8);

		// 簡單驗證年月日的合理性
		const yearNum = parseInt(year, 10);
		const monthNum = parseInt(month, 10);
		const dayNum = parseInt(day, 10);

		if (yearNum >= 1900 && yearNum <= 2100 && monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
			return `${year}-${month}-${day}`;
		}
	}

	// 如果是部分輸入，保持原樣讓瀏覽器的日期選擇器處理
	return value;
}

/**
 * 驗證日期格式
 * @param dateString 日期字串
 * @returns 是否為有效的日期格式
 */
export function isValidDate(dateString: string): boolean {
	const regex = /^\d{4}-\d{2}-\d{2}$/;

	if (!regex.test(dateString)) return false;

	const date = new Date(dateString);

	return date instanceof Date && !isNaN(date.getTime());
}

/**
 * 格式化台灣手機號碼顯示
 * @param phone 原始電話號碼
 * @returns 格式化後的電話號碼 (如: 0938-051-999)
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
	if (!phone) return '-';

	// 移除所有非數字字符
	const cleaned = phone.replace(/\D/g, '');

	// 檢查是否為台灣手機號碼格式 (09開頭，共10位數)
	if (cleaned.match(/^09\d{8}$/)) {
		return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
	}

	// 其他格式保持原樣
	return phone;
}

/**
 * 移除電話號碼格式化（用於儲存前）
 * @param phone 格式化的電話號碼
 * @returns 純數字的電話號碼
 */
export function unformatPhoneNumber(phone: string | null | undefined): string {
	if (!phone) return '';

	return phone.replace(/\D/g, '');
}
