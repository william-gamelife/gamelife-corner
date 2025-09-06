import type { NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getCorsOrigin, CORS_OPTIONS } from '@/config/cors';
import { createCorsErrorResponse, logCorsViolation } from '@/utils/corsError';

export async function middleware(request: NextRequest) {
	// 更新 Supabase 會話
	const response = await updateSession(request);

	// 設定跨域 Cookie 支援
	if (request.nextUrl.pathname.startsWith('/api/')) {
		const origin = request.headers.get('origin');
		const corsOrigin = getCorsOrigin(origin);

		// 處理 OPTIONS 預檢請求
		if (request.method === 'OPTIONS') {
			const response = new Response(null, { status: 200 });

			if (corsOrigin) {
				response.headers.set('Access-Control-Allow-Origin', corsOrigin);
				response.headers.set('Access-Control-Allow-Credentials', 'true');
				response.headers.set('Access-Control-Allow-Methods', CORS_OPTIONS.methods.join(','));
				response.headers.set('Access-Control-Allow-Headers', CORS_OPTIONS.allowedHeaders.join(', '));
				response.headers.set('Access-Control-Max-Age', CORS_OPTIONS.maxAge.toString());
			}

			return response;
		}

		// 設定 CORS headers（只有當來源被允許時）
		if (corsOrigin) {
			response.headers.set('Access-Control-Allow-Origin', corsOrigin);
			response.headers.set('Access-Control-Allow-Credentials', 'true');
			response.headers.set('Access-Control-Allow-Methods', CORS_OPTIONS.methods.join(','));
			response.headers.set('Access-Control-Allow-Headers', CORS_OPTIONS.allowedHeaders.join(', '));
		} else if (origin) {
			// 如果有 origin 但不被允許，記錄違規並返回錯誤
			logCorsViolation(origin, request.nextUrl.pathname);

			// 在生產環境中返回 CORS 錯誤
			if (process.env.NODE_ENV === 'production') {
				return createCorsErrorResponse(`Origin ${origin} is not allowed`);
			}
		}
	}

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|woff|woff2|json)$).*)'
	]
};
