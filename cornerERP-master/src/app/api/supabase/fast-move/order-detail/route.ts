import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { FastMoveOrderDetailRequest, FastMoveOrderDetailResponse } from '../types';

export async function POST(request: NextRequest) {
	try {
		// 驗證用戶身份
		const authError = await requireAuth(request);

		if (authError) {
			return authError;
		}

		const body: FastMoveOrderDetailRequest = await request.json();
		const { orderNumber } = body;

		if (!orderNumber) {
			return NextResponse.json(
				{
					success: false,
					message: '訂單編號為必填'
				},
				{ status: 400 }
			);
		}

		// 調用 FastMove API
		const response = await fetch(`https://api.cornertravel.com.tw/FastMove/QueryOrder?orderNumber=${orderNumber}`, {
			method: 'POST',
			headers: {
				accept: 'text/plain'
			},
			body: ''
		});

		if (!response.ok) {
			throw new Error(`FastMove API 錯誤: ${response.status}`);
		}

		const data = await response.json();

		const result: FastMoveOrderDetailResponse = {
			success: true,
			data: data
		};

		return NextResponse.json(result);
	} catch (error) {
		console.error('FastMove 訂單查詢錯誤:', error);
		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : '查詢失敗'
			},
			{ status: 500 }
		);
	}
}
