import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Invoice, InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';
import { createClient } from '@/lib/supabase/server';
import InvoiceModel from '@/app/(control-panel)/invoices/models/InvoiceModel';
import InvoiceItemModel from '@/app/(control-panel)/invoices/models/InvoiceItemModel';
import { requireAuth } from '@/lib/auth/middleware';
// GET - 取得單筆請款單
export async function GET(request: NextRequest, { params }: { params: { invoiceNumber: string } }) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber } = await params;
	const searchParams = request.nextUrl.searchParams;
	const includeItems = searchParams.get('includeItems') === 'true';

	// 獲取發票資料
	const { data: invoice, error: invoiceError } = await supabase
		.from('invoices')
		.select(
			`
            *,
            group:groups(group_name)
        `
		)
		.eq('invoice_number', invoiceNumber)
		.single();

	if (invoiceError) {
		return NextResponse.json({ error: invoiceError.message }, { status: 500 });
	}

	if (!invoice) {
		return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
	}

	// 如果需要包含發票項目
	if (includeItems) {
		const { data: invoiceItems, error: itemsError } = await supabase
			.from('invoice_items')
			.select(`*`)
			.eq('invoice_number', invoiceNumber);

		if (itemsError) {
			return NextResponse.json({ error: itemsError.message }, { status: 500 });
		}

		// 將發票項目添加到發票資料中
		invoice.invoiceItems = invoiceItems || [];
	}

	// 轉換欄位名稱為駝峰式命名
	const formattedInvoice = {
		invoiceNumber: invoice.invoice_number,
		groupCode: invoice.group_code,
		orderNumber: invoice.order_number,
		invoiceDate: invoice.invoice_date,
		status: invoice.status,
		createdAt: invoice.created_at,
		createdBy: invoice.created_by,
		modifiedAt: invoice.modified_at,
		modifiedBy: invoice.modified_by,
		group: {
			groupName: invoice.group?.group_name || ''
		},
		invoiceItems: invoice.invoiceItems || []
	};

	// 如果有發票項目，也轉換它們的欄位名稱
	if (invoice.invoiceItems) {
		formattedInvoice.invoiceItems = invoice.invoiceItems.map((item) => ({
			id: item.id,
			invoiceNumber: item.invoice_number,
			invoiceType: item.invoice_type,
			payFor: item.pay_for,
			price: item.price,
			quantity: item.quantity,
			note: item.note,
			createdAt: item.created_at,
			createdBy: item.created_by,
			modifiedAt: item.modified_at,
			modifiedBy: item.modified_by,
			supplier: item.supplier
				? {
						supplierName: item.supplier.supplier_name
					}
				: undefined
		}));
	}

	return NextResponse.json(formattedInvoice);
}

// PUT - 更新請款單
export async function PUT(req: NextRequest, props: { params: { invoiceNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		const { invoiceNumber } = await props.params;
		const data = await req.json();
		const { invoiceItems, ...invoiceData } = data;
		const snakeCaseInvoice = toSnakeCase(InvoiceModel(invoiceData));

		// 1. 更新發票主資料
		const { data: updatedInvoice, error: invoiceError } = await supabase
			.from('invoices')
			.update(snakeCaseInvoice)
			.eq('invoice_number', invoiceNumber)
			.select()
			.single();

		if (invoiceError) {
			console.error('更新 invoice 時出錯:', invoiceError);
			return NextResponse.json({ error: invoiceError.message }, { status: 500 });
		}

		// 2. 處理發票項目
		if (invoiceItems && Array.isArray(invoiceItems) && invoiceItems.length > 0) {
			// 先刪除現有的發票項目
			const { error: deleteItemsError } = await supabase
				.from('invoice_items')
				.delete()
				.eq('invoice_number', invoiceNumber);

			if (deleteItemsError) {
				console.error('刪除現有 invoice_items 時出錯:', deleteItemsError);
				return NextResponse.json({ error: deleteItemsError.message }, { status: 500 });
			}

			const itemsToInsert = invoiceItems.map((item) => toSnakeCase<InvoiceItem>(InvoiceItemModel(item, true)));

			const { data: insertedItems, error: itemsError } = await supabase
				.from('invoice_items')
				.insert(itemsToInsert)
				.select();

			if (itemsError) {
				console.error('插入更新後的 invoice_items 時出錯:', itemsError);
				return NextResponse.json({ error: itemsError.message }, { status: 500 });
			}

			// 返回完整的資料（包括 invoice 和 items）
			return NextResponse.json({
				...toCamelCase<Invoice>(updatedInvoice),
				invoiceItems: insertedItems
			});
		}

		// 如果沒有 invoiceItems，只返回 invoice 資料
		return NextResponse.json(toCamelCase<Invoice>(updatedInvoice), { status: 200 });
	} catch (error) {
		console.error('處理更新請求時出錯:', error);
		return NextResponse.json({ error: '處理更新請求時發生錯誤' }, { status: 500 });
	}
}

// DELETE - 刪除單筆請款單
export async function DELETE(req: NextRequest, props: { params: { invoiceNumber: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { invoiceNumber } = await props.params;

	const { error } = await supabase.from('invoices').delete().eq('invoice_number', invoiceNumber);

	if (error) {
		return NextResponse.json({ message: '刪除請款單失敗' }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
