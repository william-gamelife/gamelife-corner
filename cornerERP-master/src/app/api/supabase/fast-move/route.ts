import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	try {
		// 從查詢參數取得 forceRefresh
		const { searchParams } = new URL(req.url);
		const forceRefresh = searchParams.get('forceRefresh');

		// 建構 API URL，如果有 forceRefresh 參數則添加
		let apiUrl = 'https://api.cornertravel.com.tw/FastMove';

		if (forceRefresh === 'true') {
			apiUrl += '?forceRefresh=true';
		}

		// 使用 fetch 呼叫外部 FastMove API
		const response = await fetch(apiUrl, {
			method: 'GET',
			headers: {
				accept: 'text/plain'
			}
		});

		if (!response.ok) {
			throw new Error(`API 請求失敗: ${response.status}`);
		}

		const responseData = await response.json();

		return NextResponse.json({
			success: true,
			data: responseData
		});
	} catch (error) {
		console.error('FastMove API 錯誤:', error);
		return NextResponse.json(
			{
				success: false,
				message: '處理 FastMove 請求時發生錯誤'
			},
			{ status: 500 }
		);
	}
}

export async function POST(req: NextRequest) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	try {
		const body = await req.json();
		const { email, productId, quantity, price, groupCode, orderNumber, createdBy, invoiceNumber, esimNumber } =
			body;

		// 建構查詢參數
		const params = new URLSearchParams({
			email: email || '',
			productId: productId || '',
			quantity: quantity?.toString() || '1',
			price: price?.toString() || '0',
			groupCode: groupCode || '',
			orderNumber: orderNumber || '',
			createdBy: createdBy || '',
			invoiceNumber: invoiceNumber || '',
			esimNumber: esimNumber || ''
		});

		// 使用 fetch 呼叫外部 FastMove POST API
		const response = await fetch(`https://api.cornertravel.com.tw/FastMove?${params.toString()}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		if (!response.ok) {
			throw new Error(`FastMove POST API 請求失敗: ${response.status}`);
		}

		const responseData = await response.json();

		return NextResponse.json({
			success: true,
			data: responseData
		});
	} catch (error) {
		console.error('FastMove POST API 錯誤:', error);
		return NextResponse.json(
			{
				success: false,
				message: '處理 FastMove POST 請求時發生錯誤'
			},
			{ status: 500 }
		);
	}
}
