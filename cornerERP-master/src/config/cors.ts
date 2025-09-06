/**
 * CORS 配置
 * 管理允許的跨域來源
 */

const isDevelopment = process.env.NODE_ENV === 'development';

// 從環境變數讀取額外的允許域名
const getAdditionalOrigins = (): string[] => {
	const envOrigins = process.env.CORS_ALLOWED_ORIGINS || '';
	return envOrigins
		.split(',')
		.map((origin) => origin.trim())
		.filter((origin) => origin.length > 0);
};

// 允許的域名列表
export const ALLOWED_ORIGINS = [
	// 生產環境域名
	'https://erp.cornertravel.com.tw',

	// 從環境變數添加的域名
	...getAdditionalOrigins(),

	// 開發環境
	...(isDevelopment ? ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'] : [])
];

// CORS 配置選項
export const CORS_OPTIONS = {
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
	allowedHeaders: [
		'X-CSRF-Token',
		'X-Requested-With',
		'Accept',
		'Accept-Version',
		'Content-Length',
		'Content-MD5',
		'Content-Type',
		'Date',
		'X-Api-Version',
		'Authorization'
	],
	maxAge: 86400 // 24 小時
};

/**
 * 檢查來源是否被允許
 * @param origin 請求來源
 * @returns 是否允許
 */
export function isOriginAllowed(origin: string | null): boolean {
	if (!origin) return false;

	// 在開發環境中，額外允許 Vercel 預覽域名
	if (isDevelopment && origin.includes('.vercel.app')) {
		return true;
	}

	return ALLOWED_ORIGINS.includes(origin);
}

/**
 * 獲取 CORS origin 設定值
 * @param origin 請求來源
 * @returns CORS origin header 值
 */
export function getCorsOrigin(origin: string | null): string | false {
	if (!origin) return false;

	// 如果來源被允許，返回該來源；否則返回 false
	return isOriginAllowed(origin) ? origin : false;
}
