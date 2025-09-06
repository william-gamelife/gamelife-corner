import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Supabase session 更新中間件
 *
 * 安全策略：
 * 1. 對於一般頁面導航：使用 getSession() 快速檢查，提升用戶體驗
 * 2. 對於關鍵 API 路徑：使用 getUser() 完整驗證，確保安全性
 * 3. 所有 API 路由都有額外的 requireAuth 中間件進行二次驗證
 *
 * 這樣可以在保證安全性的同時，避免頁面重新整理時的多重重定向問題
 */
export async function updateSession(request: NextRequest) {
	let supabaseResponse = NextResponse.next({
		request
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
					supabaseResponse = NextResponse.next({
						request
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						supabaseResponse.cookies.set(name, value, options)
					);
				}
			}
		}
	);

	// Do not run code between createServerClient and
	// supabase.auth.getSession(). A simple mistake could make it very hard to debug
	// issues with users being randomly logged out.

	// 定義不需要認證的路徑
	const publicPaths = ['/sign-in', '/auth', '/api/supabase/users', '/api/auth', '/_next', '/favicon.ico'];

	// 檢查是否為公開路徑
	const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path));

	// 對於公開路徑，直接放行
	if (isPublicPath) {
		return supabaseResponse;
	}

	// 先使用 getSession 快速檢查是否有 session
	const {
		data: { session }
	} = await supabase.auth.getSession();

	// 如果沒有 session，直接重定向到登入頁
	if (!session) {
		const url = request.nextUrl.clone();
		url.pathname = '/sign-in';
		return NextResponse.redirect(url);
	}

	// 定義需要嚴格驗證的關鍵路徑（例如：涉及金錢、敏感資料的操作）
	const criticalPaths = [
		'/api/supabase/orders',
		'/api/supabase/invoices',
		'/api/supabase/receipts',
		'/api/supabase/bills'
	];

	// 檢查是否為關鍵路徑
	const isCriticalPath = criticalPaths.some((path) => request.nextUrl.pathname.startsWith(path));

	// 對於關鍵路徑，使用 getUser 進行完整驗證
	if (isCriticalPath) {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser();

		if (error || !user) {
			const url = request.nextUrl.clone();
			url.pathname = '/sign-in';
			return NextResponse.redirect(url);
		}
	}

	// IMPORTANT: You *must* return the supabaseResponse object as it is.
	// If you're creating a new response object with NextResponse.next() make sure to:
	// 1. Pass the request in it, like so:
	//    const myNewResponse = NextResponse.next({ request })
	// 2. Copy over the cookies, like so:
	//    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
	// 3. Change the myNewResponse object to fit your needs, but avoid changing
	//    the cookies!
	// 4. Finally:
	//    return myNewResponse
	// If this is not done, you may be causing the browser and server to go out
	// of sync and terminate the user's session prematurely!

	return supabaseResponse;
}
