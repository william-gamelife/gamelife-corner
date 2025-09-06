import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';

// GET - 取得指定請款單的所有項目
export async function GET(request: NextRequest, { params }: { params: Promise<{ invoiceNumber: string }> }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber } = await params;

	try {
		const { data, error } = await supabase.rpc('get_invoice_items_with_suppliers', {
			p_invoice_number: invoiceNumber
		});

		if (error) {
			console.error('Error fetching invoice items:', error);
			return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
		}

		// 轉換為 camelCase
		const items = data.map((item) => toCamelCase<InvoiceItem>(item));

		return NextResponse.json(items);
	} catch (error) {
		console.error('Error in GET /api/supabase/invoices/[invoiceNumber]/items:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

// POST - 新增項目到指定請款單
export async function POST(request: NextRequest, { params }: { params: Promise<{ invoiceNumber: string }> }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber } = await params;

	try {
		const body = await request.json();

		// 轉換為 snake_case 並加入請款單號
		const itemData = toSnakeCase({
			...body,
			invoiceNumber
		});

		// 移除 id 欄位（因為是新增，讓資料庫自動產生）
		const { id, ...createData } = itemData;

		const { data: insertedData, error: insertError } = await supabase
			.from('invoice_items')
			.insert(createData)
			.select('id')
			.single();

		if (insertError) {
			console.error('Error creating invoice item:', insertError);
			return NextResponse.json({ error: 'Failed to create invoice item' }, { status: 500 });
		}

		// 使用 stored procedure 取得完整資料（包含供應商名稱）
		const { data: itemsData, error: fetchError } = await supabase.rpc('get_invoice_items_with_suppliers', {
			p_invoice_number: invoiceNumber
		});

		if (fetchError) {
			console.error('Error fetching created item:', fetchError);
			return NextResponse.json({ error: 'Failed to fetch created item' }, { status: 500 });
		}

		// 找出新建立的項目
		const newItem = itemsData.find((item) => item.id === insertedData.id);

		if (!newItem) {
			return NextResponse.json({ error: 'Created item not found' }, { status: 500 });
		}

		const result = toCamelCase<InvoiceItem>(newItem);
		return NextResponse.json(result, { status: 201 });
	} catch (error) {
		console.error('Error in POST /api/supabase/invoices/[invoiceNumber]/items:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
