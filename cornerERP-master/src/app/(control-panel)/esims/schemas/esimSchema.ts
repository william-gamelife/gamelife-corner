import * as yup from 'yup';

export const esimSchema = yup
	.object({
		groupCode: yup.string().required('請輸入團號'),
		orderNumber: yup.string(),
		status: yup.number().oneOf([0, 1, 2], '狀態必須為 0:待確認, 1:已確認, 2:錯誤').default(0),
		productRegion: yup.string(),
		productId: yup.string().required('請選擇產品'),
		quantity: yup.number().min(1, '數量至少為1').max(9, '數量最多為9').required('請選擇數量').default(1),
		email: yup.string().email('請輸入有效的信箱格式').required('請輸入信箱'),
		note: yup.string() // 備註欄位，可選
	})
	.required();

export type EsimFormData = yup.InferType<typeof esimSchema>;
