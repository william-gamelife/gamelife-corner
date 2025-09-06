/**
 * 批量為 API 路由添加認證中間件的輔助函數
 * 這個檔案包含用於快速修復多個 API 路由的認證問題
 */

export const AUTH_MIDDLEWARE_IMPORTS = `import { requireAuth, requireAdmin } from '@/lib/auth/middleware';`;

export const REQUIRE_AUTH_CHECK = `
	// 檢查認證
	const authError = await requireAuth(req);
	if (authError) {
		return authError;
	}
`;

export const REQUIRE_ADMIN_CHECK = `
	// 檢查管理員權限
	const adminError = await requireAdmin(req);
	if (adminError) {
		return adminError;
	}
`;

/**
 * 需要認證但不需要特殊權限的路由列表
 */
export const REQUIRE_AUTH_ROUTES = [
	'src/app/api/supabase/customers/route.ts',
	'src/app/api/supabase/customers/[id]/route.ts',
	'src/app/api/supabase/customers/search/route.ts',
	'src/app/api/supabase/orders/route.ts',
	'src/app/api/supabase/orders/[orderNumber]/route.ts',
	'src/app/api/supabase/orders/by-search/route.ts',
	'src/app/api/supabase/orders/for-select/route.ts',
	'src/app/api/supabase/orders/group/[groupCode]/route.ts',
	'src/app/api/supabase/groups/route.ts',
	'src/app/api/supabase/groups/[groupCode]/route.ts',
	'src/app/api/supabase/invoices/route.ts',
	'src/app/api/supabase/invoices/[invoiceNumber]/route.ts',
	'src/app/api/supabase/invoices/[invoiceNumber]/status/route.ts',
	'src/app/api/supabase/invoices/by-group/[groupCode]/route.ts',
	'src/app/api/supabase/invoices/filtered/route.ts',
	'src/app/api/supabase/receipts/route.ts',
	'src/app/api/supabase/receipts/[receiptNumber]/route.ts',
	'src/app/api/supabase/receipts/by-order/[orderNumber]/route.ts',
	'src/app/api/supabase/receipts/by-group/[groupCode]/route.ts',
	'src/app/api/supabase/bills/route.ts',
	'src/app/api/supabase/bills/[billNumber]/route.ts',
	'src/app/api/supabase/suppliers/route.ts',
	'src/app/api/supabase/suppliers/[supplierCode]/route.ts',
	'src/app/api/supabase/esims/route.ts',
	'src/app/api/supabase/esims/[esimNumber]/route.ts',
	'src/app/api/supabase/max-numbers/[key]/route.ts'
];

/**
 * 需要管理員權限的路由列表
 */
export const REQUIRE_ADMIN_ROUTES = [
	'src/app/api/supabase/group-bonus-settings/route.ts',
	'src/app/api/supabase/group-bonus-settings/[id]/route.ts',
	'src/app/api/supabase/fast-move/route.ts',
	'src/app/api/supabase/linkpay/route.ts'
];

/**
 * 路由修復狀態追蹤
 */
export const FIXED_ROUTES = ['src/app/api/supabase/users/route.ts', 'src/app/api/supabase/users/[id]/route.ts'];

/**
 * 需要特殊處理的路由
 * 這些路由可能需要自定義認證邏輯
 */
export const SPECIAL_ROUTES = {
	'src/app/api/supabase/users/route.ts': 'POST method is login - no auth required',
	'src/app/api/auth/refresh-token/route.ts': 'Already has auth check'
};
