import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * 根據訂單號碼獲取收據
 * GET /api/supabase/receipts/by-order/[orderNumber]
 */
export async function GET(request: NextRequest, { params }: { params: { orderNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		const { orderNumber } = await params;

		if (!orderNumber) {
			return NextResponse.json({ error: '訂單號碼不能為空' }, { status: 400 });
		}

		// 查詢與訂單號碼匹配的收據，並同時獲取 LinkPay 資訊
		// 排序：先按訂單編號，再按收款編號
		const { data, error } = await supabase
			.from('receipts')
			.select(
				`
				*,
				linkpay:receipt_linkpay_log!receipt_number(*)
			`
			)
			.eq('order_number', orderNumber)
			.order('order_number', { ascending: true })
			.order('receipt_number', { ascending: true });

		if (error) {
			console.error('Error fetching receipts by order number:', error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 將蛇形命名轉換為駝峰命名，並處理 linkpay 資訊
		const receipts = data.map((receipt) => {
			const formattedReceipt = toCamelCase(receipt);

			// 如果有 LinkPay 資訊，也轉換為駝峰命名
			if (receipt.linkpay && receipt.linkpay.length > 0) {
				formattedReceipt.linkpay = receipt.linkpay.map((linkpay) => toCamelCase(linkpay));
			}

			return formattedReceipt;
		});

		return NextResponse.json(receipts);
	} catch (error) {
		console.error('Error in receipts by order number API:', error);
		return NextResponse.json({ error: '獲取收據時發生錯誤' }, { status: 500 });
	}
}
