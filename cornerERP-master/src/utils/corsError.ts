import { NextResponse } from 'next/server';
import { getTaipeiTimestamp } from './timezone';

/**
 * 創建 CORS 錯誤響應
 * @param message 錯誤訊息
 * @returns NextResponse 物件
 */
export function createCorsErrorResponse(message = 'CORS policy violation') {
	return NextResponse.json(
		{
			error: 'CORS_ERROR',
			message,
			timestamp: getTaipeiTimestamp()
		},
		{
			status: 403,
			headers: {
				'Content-Type': 'application/json',
				'X-Content-Type-Options': 'nosniff'
			}
		}
	);
}

/**
 * 記錄 CORS 違規
 * @param origin 請求來源
 * @param path 請求路徑
 */
export function logCorsViolation(origin: string | null, path: string) {
	const timestamp = getTaipeiTimestamp();
	const violation = {
		timestamp,
		origin: origin || 'no-origin',
		path,
		userAgent: 'unknown' // 在 middleware 中無法獲取 user-agent
	};

	// 在生產環境中，這裡可以整合監控服務（如 Sentry）
	if (process.env.NODE_ENV !== 'production') {
		// eslint-disable-next-line no-console
		console.warn('[CORS Violation]', JSON.stringify(violation));
	}
}
