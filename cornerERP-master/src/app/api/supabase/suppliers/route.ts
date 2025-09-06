import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTaipeiTimestamp } from '@/utils/timezone';

export async function GET(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();

	// 獲取URL中的查詢參數
	const url = new URL(request.url);
	const searchParams = url.searchParams;

	// 構建查詢
	let query = supabase.from('suppliers').select('*');

	// 處理篩選條件
	if (searchParams.has('supplierCode') && searchParams.get('supplierCode') !== '') {
		query = query.eq('supplier_code', searchParams.get('supplierCode'));
	}

	if (searchParams.has('supplierName') && searchParams.get('supplierName') !== '') {
		query = query.ilike('supplier_name', `%${searchParams.get('supplierName')}%`);
	}

	if (searchParams.has('supplierType') && searchParams.get('supplierType') !== '') {
		query = query.eq('supplier_type', searchParams.get('supplierType'));
	}

	if (searchParams.has('isQuoted') && searchParams.get('isQuoted') !== '') {
		query = query.eq('is_quoted', searchParams.get('isQuoted') === 'true');
	}

	// 執行查詢
	const { data, error } = await query;

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換欄位名稱為駝峰式命名
	const formattedData = data.map((supplier) => ({
		supplierCode: supplier.supplier_code,
		supplierName: supplier.supplier_name,
		supplierType: supplier.supplier_type,
		accountCode: supplier.account_code,
		accountName: supplier.account_name,
		bankCode: supplier.bank_code,
		isQuoted: supplier.is_quoted,
		createdAt: supplier.created_at,
		createdBy: supplier.created_by,
		modifiedAt: supplier.modified_at,
		modifiedBy: supplier.modified_by
	}));

	return NextResponse.json(formattedData);
}

export async function POST(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const newSupplier = await request.json();

	// 轉換欄位名稱為蛇形命名
	const formattedSupplier = {
		supplier_code: newSupplier.supplierCode,
		supplier_name: newSupplier.supplierName,
		supplier_type: newSupplier.supplierType,
		account_code: newSupplier.accountCode,
		account_name: newSupplier.accountName,
		bank_code: newSupplier.bankCode,
		is_quoted: newSupplier.isQuoted,
		created_at: getTaipeiTimestamp(),
		created_by: newSupplier.createdBy,
		modified_at: getTaipeiTimestamp(),
		modified_by: newSupplier.modifiedBy
	};

	const { data, error } = await supabase.from('suppliers').insert(formattedSupplier).select().single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// 轉換回駝峰式命名
	const formattedResponse = {
		supplierCode: data.supplier_code,
		supplierName: data.supplier_name,
		supplierType: data.supplier_type,
		accountCode: data.account_code,
		accountName: data.account_name,
		bankCode: data.bank_code,
		isQuoted: data.is_quoted,
		createdAt: data.created_at,
		createdBy: data.created_by,
		modifiedAt: data.modified_at,
		modifiedBy: data.modified_by
	};

	return NextResponse.json(formattedResponse);
}

export async function DELETE(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const supplierCodes = await request.json();

	const { error } = await supabase.from('suppliers').delete().in('supplier_code', supplierCodes);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
