import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';

export async function POST(req: NextRequest) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	try {
		const { receiptNumber, userName, email, gender, createUser, paymentName } = await req.json();

		// 使用 fetch 替代 axios 呼叫外部 LinkPay API
		const response = await fetch('https://api.cornertravel.com.tw/AuthBySupabase', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				receiptNo: receiptNumber,
				userName,
				email,
				gender: 0,
				createUser,
				paymentName
			})
		});

		if (!response.ok) {
			throw new Error(`API 請求失敗: ${response.status}`);
		}

		const responseData = await response.json();
		const { ret_code, hpp_url, order_number } = await responseData.params;

		if (ret_code === '00') {
			return NextResponse.json({
				success: true,
				message: '付款連結生成成功',
				paymentLink: hpp_url,
				orderNumber: order_number
			});
		} else {
			return NextResponse.json(
				{
					success: false,
					message: '產生付款連結失敗，請稍候再嘗試。'
				},
				{ status: 400 }
			);
		}
	} catch (error) {
		console.error('LinkPay API 錯誤:', error);
		return NextResponse.json(
			{
				success: false,
				message: '處理 LinkPay 請求時發生錯誤'
			},
			{ status: 500 }
		);
	}
}
