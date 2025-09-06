import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/middleware';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';

// GET - 取得單一項目
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ invoiceNumber: string; itemId: string }> }
) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber, itemId } = await params;

	try {
		const { data, error } = await supabase.rpc('get_invoice_items_with_suppliers', {
			p_invoice_number: invoiceNumber
		});

		if (error) {
			console.error('Error fetching invoice items:', error);
			return NextResponse.json({ error: 'Failed to fetch invoice items' }, { status: 500 });
		}

		// 找出指定的項目
		const item = data.find((item) => item.id === parseInt(itemId));

		if (!item) {
			return NextResponse.json({ error: 'Invoice item not found' }, { status: 404 });
		}

		const result = toCamelCase<InvoiceItem>(item);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in GET /api/supabase/invoices/[invoiceNumber]/items/[itemId]:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

// PUT - 更新指定項目
export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ invoiceNumber: string; itemId: string }> }
) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber, itemId } = await params;

	try {
		const body = await request.json();

		// 驗證項目是否存在且屬於指定的請款單
		const { data: existingItem, error: fetchError } = await supabase
			.from('invoice_items')
			.select('id')
			.eq('invoice_number', invoiceNumber)
			.eq('id', parseInt(itemId))
			.single();

		if (fetchError) {
			if (fetchError.code === 'PGRST116') {
				return NextResponse.json({ error: 'Invoice item not found' }, { status: 404 });
			}

			console.error('Error verifying invoice item:', fetchError);
			return NextResponse.json({ error: 'Failed to verify invoice item' }, { status: 500 });
		}

		// 準備更新資料，轉換為 snake_case
		const updateData = toSnakeCase(body);

		// 移除不應該更新的欄位（包含不存在於資料庫表中的欄位）
		const {
			id,
			invoice_number,
			created_at,
			created_by,
			supplier_name, // 移除 supplier_name（來自 stored procedure JOIN）
			...safeUpdateData
		} = updateData;

		const { error: updateError } = await supabase
			.from('invoice_items')
			.update(safeUpdateData)
			.eq('id', parseInt(itemId));

		if (updateError) {
			console.error('Error updating invoice item:', updateError);
			return NextResponse.json({ error: 'Failed to update invoice item' }, { status: 500 });
		}

		// 使用 stored procedure 取得更新後的完整資料
		const { data: itemsData, error: fetchUpdatedError } = await supabase.rpc('get_invoice_items_with_suppliers', {
			p_invoice_number: invoiceNumber
		});

		if (fetchUpdatedError) {
			console.error('Error fetching updated item:', fetchUpdatedError);
			return NextResponse.json({ error: 'Failed to fetch updated item' }, { status: 500 });
		}

		// 找出更新的項目
		const updatedItem = itemsData.find((item) => item.id === parseInt(itemId));

		if (!updatedItem) {
			return NextResponse.json({ error: 'Updated item not found' }, { status: 500 });
		}

		const result = toCamelCase<InvoiceItem>(updatedItem);
		return NextResponse.json(result);
	} catch (error) {
		console.error('Error in PUT /api/supabase/invoices/[invoiceNumber]/items/[itemId]:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}

// DELETE - 刪除指定項目
export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ invoiceNumber: string; itemId: string }> }
) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber, itemId } = await params;

	try {
		// 驗證項目是否存在且屬於指定的請款單
		const { data: existingItem, error: fetchError } = await supabase
			.from('invoice_items')
			.select('id')
			.eq('invoice_number', invoiceNumber)
			.eq('id', parseInt(itemId))
			.single();

		if (fetchError) {
			if (fetchError.code === 'PGRST116') {
				return NextResponse.json({ error: 'Invoice item not found' }, { status: 404 });
			}

			console.error('Error verifying invoice item:', fetchError);
			return NextResponse.json({ error: 'Failed to verify invoice item' }, { status: 500 });
		}

		const { error } = await supabase.from('invoice_items').delete().eq('id', parseInt(itemId));

		if (error) {
			console.error('Error deleting invoice item:', error);
			return NextResponse.json({ error: 'Failed to delete invoice item' }, { status: 500 });
		}

		return NextResponse.json({ message: 'Invoice item deleted successfully' });
	} catch (error) {
		console.error('Error in DELETE /api/supabase/invoices/[invoiceNumber]/items/[itemId]:', error);
		return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
	}
}
