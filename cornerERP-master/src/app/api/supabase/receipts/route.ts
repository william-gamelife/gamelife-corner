import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { createClient } from '@/lib/supabase/server';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import ReceiptModel from '@/app/(control-panel)/receipts/models/ReceiptModel';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const searchParams = req.nextUrl.searchParams;

	// 構建基礎查詢，只選擇必要的欄位
	let query = supabase.from('receipts').select(
		`
		*,
			orders:order_number (
				group_code,
				groups:group_code (
					group_name
				)
			)
		`
	);

	// 處理收款單號 - 使用模糊查詢
	const receiptNumber = searchParams.get('receiptNumber');

	if (receiptNumber) {
		query = query.ilike('receipt_number', `%${receiptNumber}%`);
	}

	// 處理訂單編號 - 使用模糊查詢
	const orderNumber = searchParams.get('orderNumber');

	if (orderNumber) {
		query = query.ilike('order_number', `%${orderNumber}%`);
	}

	// // 處理團號 - 使用 trigram 索引優化
	// const groupCode = searchParams.get('groupCode');

	// if (groupCode) {
	// 	query = query.textSearch('group_code', groupCode, {
	// 		type: 'websearch',
	// 		config: 'simple'
	// 	});
	// }

	// 處理日期範圍 - 使用索引優化
	const startDate = searchParams.get('startDate');

	if (startDate) {
		query = query.gte('receipt_date', startDate);
	}

	const endDate = searchParams.get('endDate');

	if (endDate) {
		query = query.lte('receipt_date', endDate);
	}

	// 處理狀態 - 使用索引優化
	const statusValues = searchParams.getAll('status');

	if (statusValues && statusValues.length > 0) {
		// 處理可能的 JSON 字串格式陣列
		let processedStatusValues = statusValues;

		// 如果只有一個值且看起來是 JSON 陣列字串，嘗試解析它
		if (statusValues.length === 1 && statusValues[0].startsWith('[') && statusValues[0].endsWith(']')) {
			try {
				const parsed = JSON.parse(statusValues[0]);

				if (Array.isArray(parsed)) {
					processedStatusValues = parsed.map((val) => String(val));
				}
			} catch (error) {
				console.error('收款單 API - 無法解析狀態陣列:', statusValues[0], error);
				// 使用原始值
			}
		}

		// 確保所有值都是數字格式 (smallint 欄位)
		const numericStatusValues = processedStatusValues.map((val) => parseInt(val, 10)).filter((val) => !isNaN(val));

		if (numericStatusValues.length > 0) {
			query = query.in('status', numericStatusValues);
		}
	}

	// 處理收款方式 - 使用索引優化
	const receiptTypeValues = searchParams.getAll('receiptType');

	if (receiptTypeValues && receiptTypeValues.length > 0) {
		// 處理可能的 JSON 字串格式陣列
		let processedReceiptTypeValues = receiptTypeValues;

		// 如果只有一個值且看起來是 JSON 陣列字串，嘗試解析它
		if (
			receiptTypeValues.length === 1 &&
			receiptTypeValues[0].startsWith('[') &&
			receiptTypeValues[0].endsWith(']')
		) {
			try {
				const parsed = JSON.parse(receiptTypeValues[0]);

				if (Array.isArray(parsed)) {
					processedReceiptTypeValues = parsed.map((val) => String(val));
				}
			} catch (error) {
				console.warn('無法解析收款方式陣列:', receiptTypeValues[0], error);
				// 使用原始值
			}
		}

		// 確保所有值都是數字格式 (smallint 欄位)
		const numericReceiptTypeValues = processedReceiptTypeValues
			.map((val) => parseInt(val, 10))
			.filter((val) => !isNaN(val));

		if (numericReceiptTypeValues.length > 0) {
			query = query.in('receipt_type', numericReceiptTypeValues);
		}
	}

	// 處理顯示數量限制
	const limit = searchParams.get('limit');

	if (limit) {
		query = query.limit(parseInt(limit, 10));
	} else {
		query = query.limit(200); // 預設限制 200 筆
	}

	// 執行查詢
	const { data, error } = await query.order('receipt_number', { ascending: false });

	if (error) {
		console.error('錯誤:', error);
		return NextResponse.json({ message: error.message }, { status: 500 });
	}

	// 轉換為駝峰命名
	const receipts = data.map((receipt) => {
		const transformed = toCamelCase(receipt);
		return {
			...transformed,
			groupCode: receipt.orders?.group_code || '',
			groupName: receipt.orders?.groups?.group_name || ''
		};
	});

	return NextResponse.json(receipts);
}

export async function POST(request: NextRequest) {
	const authError = await requireAuth(request);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const receipt = await request.json();

	const snakeCaseReceipt = toSnakeCase<Receipt>(ReceiptModel(receipt));

	const { data, error } = await supabase.from('receipts').insert(snakeCaseReceipt).select().single();

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
	const receiptNumbers = await request.json();
	const { error } = await supabase.from('receipts').delete().in('receipt_number', receiptNumbers);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
