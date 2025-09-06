import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';

export async function POST(request: NextRequest) {
	try {
		// 驗證使用者認證
		const user = await requireAuth(request);

		// 取得 FormData
		const formData = await request.formData();
		const file = formData.get('file') as File;
		const groupCode = formData.get('groupCode') as string;
		const employeeId = formData.get('employeeId') as string;

		// 驗證必要參數
		if (!file) {
			return NextResponse.json({ success: false, message: '缺少檔案' }, { status: 400 });
		}

		if (!groupCode) {
			return NextResponse.json({ success: false, message: '缺少團號' }, { status: 400 });
		}

		if (!employeeId) {
			return NextResponse.json({ success: false, message: '缺少員工ID' }, { status: 400 });
		}

		// 建立要發送到外部 API 的 FormData
		const externalFormData = new FormData();
		externalFormData.append('file', file);
		externalFormData.append('groupCode', groupCode);
		externalFormData.append('employeeId', employeeId);

		// 呼叫外部 API
		const response = await fetch('https://api.cornertravel.com.tw/api/Import/customers', {
			method: 'POST',
			body: externalFormData
			// 不需要設定 Content-Type，讓瀏覽器自動設定
		});

		// 處理外部 API 回應
		if (!response.ok) {
			const errorText = await response.text();
			console.error('外部 API 錯誤:', response.status, errorText);
			return NextResponse.json(
				{
					success: false,
					message: `匯入失敗：HTTP ${response.status}`
				},
				{ status: response.status }
			);
		}

		// 嘗試解析 JSON 回應
		let result;
		try {
			result = await response.json();
		} catch (parseError) {
			// 如果不是 JSON，嘗試取得文字回應
			const textResult = await response.text();
			console.log('外部 API 文字回應:', textResult);
			result = {
				success: true,
				message: '匯入完成',
				data: textResult
			};
		}

		// 回傳結果
		return NextResponse.json({
			success: true,
			message: result.message || '匯入完成',
			data: result.data || result
		});
	} catch (error) {
		console.error('匯入旅客資料錯誤:', error);
		return NextResponse.json(
			{
				success: false,
				message: error instanceof Error ? error.message : '匯入失敗，請稍後再試'
			},
			{ status: 500 }
		);
	}
}
