import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { Bill } from '@/app/(control-panel)/bills/BillApi';
import BillModel from '@/app/(control-panel)/bills/models/BillModel';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();

	// 獲取所有查詢參數
	const url = new URL(req.url);
	const billNumber = url.searchParams.get('billNumber');
	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const statusParam = url.searchParams.get('status');
	const limit = url.searchParams.get('limit') || '100';

	// 處理狀態參數，可能是 JSON 字串形式的陣列
	const status = statusParam ? JSON.parse(statusParam) : null;

	// 構建基礎查詢
	let query = supabase.from('bills').select('*');

	// 添加所有過濾條件
	if (billNumber) {
		query = query.ilike('bill_number', `%${billNumber}%`);
	}

	if (dateFrom) {
		query = query.gte('bill_date', dateFrom);
	}

	if (dateTo) {
		query = query.lte('bill_date', dateTo);
	}

	// 處理狀態過濾
	if (status && Array.isArray(status) && status.length > 0) {
		query = query.in('status', status);
	}

	// 添加排序和限制
	query = query.order('bill_number', { ascending: false }).limit(parseInt(limit));

	// 執行查詢
	const { data, error } = await query;

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const bills = data.map((bill) => toCamelCase(bill));
	return NextResponse.json(bills);
}

export async function POST(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const bill = await request.json();
	const snakeCaseBill = toSnakeCase<Bill>(BillModel(bill));

	const { data, error } = await supabase.from('bills').insert(snakeCaseBill).select().single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase(data));
}

export async function DELETE(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const billNumbers = await request.json();
	const { error } = await supabase.from('bills').delete().in('bill_number', billNumbers);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
