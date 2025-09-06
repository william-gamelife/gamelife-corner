import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase } from '@/utils/tools';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { groupCode } = await props.params;

	// 1. 首先獲取該團號的所有訂單
	const { data: orders, error: ordersError } = await supabase
		.from('orders')
		.select('order_number')
		.eq('group_code', groupCode);

	if (ordersError) {
		return NextResponse.json({ message: '找不到訂單' }, { status: 404 });
	}

	if (!orders || orders.length === 0) {
		return NextResponse.json([], { status: 200 });
	}

	// 2. 提取所有訂單編號
	const orderNumbers = orders.map((order) => order.order_number);

	// 3. 根據訂單編號獲取收據
	const { data: receipts, error: receiptsError } = await supabase
		.from('receipts')
		.select('*')
		.in('order_number', orderNumbers)
		.order('order_number', { ascending: true })
		.order('receipt_number', { ascending: true });

	if (receiptsError) {
		return NextResponse.json({ message: '找不到收據' }, { status: 404 });
	}

	// 4. 轉換為駝峰命名並返回
	const formattedReceipts = receipts.map((receipt) => toCamelCase<Receipt>(receipt));
	return NextResponse.json(formattedReceipts, { status: 200 });
}
