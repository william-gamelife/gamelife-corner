/**
 * 台北時區日期處理工具函數
 * 解決跨時區日期轉換問題，確保所有日期處理使用台北時區 (UTC+8)
 */

// 台北時區標識
const TAIPEI_TIMEZONE = 'Asia/Taipei';

/**
 * 將 Date 物件格式化為 YYYY-MM-DD 格式 (台北時區)
 * 用於 API 查詢參數，避免 toISOString() 造成的時區偏差
 *
 * @param date - 要格式化的日期物件
 * @returns YYYY-MM-DD 格式的字串，若 date 為 null/undefined 則回傳 undefined
 *
 * @example
 * const date = new Date('2025-12-01T00:00:00.000Z');
 * formatDateForAPI(date); // "2025-12-01"
 */
export const formatDateForAPI = (date: Date | null | undefined): string | undefined => {
	if (!date) return undefined;

	// 使用 toLocaleDateString 確保台北時區
	const formatted = date.toLocaleDateString('zh-TW', {
		timeZone: TAIPEI_TIMEZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

	// 將 YYYY/MM/DD 轉換為 YYYY-MM-DD
	return formatted.replace(/\//g, '-');
};

/**
 * 取得台北時區的當前時間戳 (YYYY-MM-DD HH:mm:ss 格式)
 * 用於 API 路由的 created_at、modified_at 等時間戳欄位
 *
 * @returns 台北時區的時間戳字串
 *
 * @example
 * getTaipeiTimestamp(); // "2025-01-20 14:30:45"
 */
export const getTaipeiTimestamp = (): string => {
	return new Date().toLocaleString('sv-SE', {
		timeZone: TAIPEI_TIMEZONE
	});
};

/**
 * 處理日期範圍查詢參數
 * 將兩個日期物件轉換為 API 查詢格式
 *
 * @param dateFrom - 起始日期
 * @param dateTo - 結束日期
 * @returns 包含 dateFrom 和 dateTo 的物件
 *
 * @example
 * const range = formatDateRangeForAPI(
 *   new Date('2025-01-01'),
 *   new Date('2025-01-31')
 * );
 * // { dateFrom: "2025-01-01", dateTo: "2025-01-31" }
 */
export const formatDateRangeForAPI = (dateFrom: Date | null | undefined, dateTo: Date | null | undefined) => {
	return {
		dateFrom: formatDateForAPI(dateFrom),
		dateTo: formatDateForAPI(dateTo)
	};
};

/**
 * 解析 API 回傳的日期字串為 Date 物件 (台北時區)
 * 用於處理從資料庫取得的日期資料
 *
 * @param dateString - API 回傳的日期字串 (YYYY-MM-DD 或 ISO 格式)
 * @returns Date 物件，若輸入無效則回傳 null
 *
 * @example
 * parseDateFromAPI("2025-01-20"); // Date 物件 (台北時區)
 * parseDateFromAPI("2025-01-20T06:30:45.000Z"); // Date 物件 (台北時區)
 */
export const parseDateFromAPI = (dateString: string | null | undefined): Date | null => {
	if (!dateString) return null;

	try {
		const date = new Date(dateString);

		if (isNaN(date.getTime())) return null;

		return date;
	} catch {
		return null;
	}
};

/**
 * 比較兩個日期是否為同一天 (台北時區)
 * 忽略時、分、秒的差異
 *
 * @param date1 - 第一個日期
 * @param date2 - 第二個日期
 * @returns 是否為同一天
 *
 * @example
 * const date1 = new Date('2025-01-20T08:00:00');
 * const date2 = new Date('2025-01-20T20:00:00');
 * isSameDay(date1, date2); // true
 */
export const isSameDay = (date1: Date | null | undefined, date2: Date | null | undefined): boolean => {
	if (!date1 || !date2) return false;

	const formatted1 = formatDateForAPI(date1);
	const formatted2 = formatDateForAPI(date2);

	return formatted1 === formatted2;
};

/**
 * 取得今天的日期 (台北時區，YYYY-MM-DD 格式)
 *
 * @returns 今天的日期字串
 *
 * @example
 * getTodayForAPI(); // "2025-01-20"
 */
export const getTodayForAPI = (): string => {
	return formatDateForAPI(new Date()) || '';
};

/**
 * 將 API 的日期字串轉換為顯示格式
 *
 * @param dateString - API 回傳的日期字串
 * @param locale - 地區設定，預設為繁體中文
 * @returns 格式化的日期字串
 *
 * @example
 * formatDateForDisplay("2025-01-20"); // "2025年1月20日"
 * formatDateForDisplay("2025-01-20", 'en-US'); // "1/20/2025"
 */
export const formatDateForDisplay = (dateString: string | null | undefined, locale = 'zh-TW'): string => {
	const date = parseDateFromAPI(dateString);

	if (!date) return '';

	return date.toLocaleDateString(locale, {
		timeZone: TAIPEI_TIMEZONE,
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
};
