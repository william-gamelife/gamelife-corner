import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Invoice, InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';
import { createClient } from '@/lib/supabase/server';
import InvoiceModel from '@/app/(control-panel)/invoices/models/InvoiceModel';
import InvoiceItemModel from '@/app/(control-panel)/invoices/models/InvoiceItemModel';
import { requireAuth } from '@/lib/auth/middleware';

// GET - 取得所有請款單
export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();

	// 獲取所有查詢參數
	const url = new URL(req.url);
	const invoiceNumber = url.searchParams.get('invoiceNumber');
	const groupCode = url.searchParams.get('groupCode');
	const orderNumber = url.searchParams.get('orderNumber');
	const dateFrom = url.searchParams.get('dateFrom');
	const dateTo = url.searchParams.get('dateTo');
	const statusParam = url.searchParams.get('status');
	const limit = url.searchParams.get('limit') || '100';

	// 處理狀態參數，可能是 JSON 字串形式的陣列
	const status = statusParam ? JSON.parse(statusParam) : null;

	// 構建基礎查詢
	let query = supabase.from('invoices').select(
		`
            *,
			invoice_items:invoice_items (
				price,
				quantity
			),
            group:group_code (
                group_name
            )
        `
	);

	// 添加所有過濾條件
	if (invoiceNumber) {
		query = query.ilike('invoice_number', `%${invoiceNumber}%`);
	}

	if (groupCode) {
		query = query.ilike('group_code', `%${groupCode}%`);
	}

	if (orderNumber) {
		query = query.ilike('order_number', `%${orderNumber}%`);
	}

	if (dateFrom) {
		query = query.gte('invoice_date', dateFrom);
	}

	if (dateTo) {
		query = query.lte('invoice_date', dateTo);
	}

	// 處理狀態過濾
	if (status && Array.isArray(status) && status.length > 0) {
		query = query.in('status', status);
	}

	// 添加排序和限制
	query = query.order('invoice_date', { ascending: false }).limit(parseInt(limit));

	// 執行查詢
	const { data, error } = await query;

	if (error) {
		console.error('取得請款單資料時出錯:', error);
		return NextResponse.json({ message: '找不到請款單資料' }, { status: 404 });
	}

	const invoices = data.map((invoice) =>
		toCamelCase<Invoice>({
			...invoice,
			group: { groupName: invoice.group?.group_name },
			invoiceItems: invoice.invoice_items
		})
	);
	return NextResponse.json(invoices, { status: 200 });
}

// POST - 新增請款單
export async function POST(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		const data = await req.json();
		const { invoiceItems, ...invoiceData } = data;
		// 開始一個事務來確保資料一致性
		// 注意：Supabase JS 客戶端目前不直接支持事務，所以我們需要手動處理錯誤和回滾

		// 1. 首先插入 invoice 資料
		const { data: insertedInvoice, error: invoiceError } = await supabase
			.from('invoices')
			.insert(toSnakeCase<Invoice>(InvoiceModel(invoiceData)))
			.select()
			.single();

		if (invoiceError) {
			console.error('插入 invoice 時出錯:', invoiceError);
			return NextResponse.json({ error: invoiceError.message }, { status: 500 });
		}

		// 2. 如果有 invoiceItems，則插入到 invoice_items 表
		if (invoiceItems && Array.isArray(invoiceItems) && invoiceItems.length > 0) {
			// 為每個 item 添加 invoice_number
			const itemsToInsert = invoiceItems.map((item) =>
				toSnakeCase<InvoiceItem>(
					InvoiceItemModel({ ...item, invoiceNumber: insertedInvoice.invoice_number }, true)
				)
			);

			const { data: insertedItems, error: itemsError } = await supabase
				.from('invoice_items')
				.insert(itemsToInsert)
				.select();

			if (itemsError) {
				// 如果插入 items 失敗，我們應該嘗試刪除剛才插入的 invoice
				console.error('插入 invoice_items 時出錯:', itemsError);

				// 嘗試刪除剛才插入的 invoice
				const { error: deleteError } = await supabase
					.from('invoices')
					.delete()
					.eq('invoiceNumber', invoiceData.invoiceNumber);

				if (deleteError) {
					console.error('回滾刪除 invoice 時出錯:', deleteError);
				}

				return NextResponse.json({ error: itemsError.message }, { status: 500 });
			}

			// 返回完整的資料（包括 invoice 和 items）
			return NextResponse.json({
				...insertedInvoice,
				invoiceItems: insertedItems
			});
		}

		// 如果沒有 invoiceItems，只返回 invoice 資料
		return NextResponse.json(insertedInvoice);
	} catch (error) {
		console.error('處理請求時出錯:', error);
		return NextResponse.json({ error: '處理請求時發生錯誤' }, { status: 500 });
	}
}

// DELETE - 刪除多筆請款單
export async function DELETE(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const invoiceNumbers = (await req.json()) as string[];

	const { error } = await supabase.from('invoices').delete().in('invoice_number', invoiceNumbers);

	if (error) {
		return NextResponse.json({ message: '刪除請款單失敗' }, { status: 500 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
