import { z } from 'zod';
import { RECEIPT_TYPES } from 'src/constants/receiptTypes';

/**
 * 創建基本的收款 schema
 * @param options 配置選項
 * @returns Zod schema
 */
export function createBaseReceiptSchema(
	options: {
		includeReceiptNumber?: boolean; // 是否包含收款編號驗證
		statusRequired?: boolean; // 狀態是否為必填
	} = {}
) {
	const { includeReceiptNumber = false, statusRequired = false } = options;

	// 基本 schema
	const baseSchema = {
		orderNumber: z.string().min(1, '訂單編號不能為空'),
		receiptDate: z.union([z.string(), z.date()]),
		receiptType: z.nativeEnum(RECEIPT_TYPES, {
			message: '付款方式不能為空'
		}),
		receiptAmount: z.number().min(1, '收款金額不能小於 0'),
		receiptAccount: z.string().optional().nullable(),
		payDateline: z.union([z.string(), z.date(), z.null()]).optional(),
		email: z.string().optional().nullable(),
		note: z.string().optional().nullable(),
		status: statusRequired ? z.number() : z.number().optional().nullable()
	};

	// 如果需要包含收款編號驗證
	if (includeReceiptNumber) {
		return z.object({
			receiptNumber: z.string().min(1, '收款單號不能為空'),
			...baseSchema
		});
	}

	return z.object(baseSchema);
}

/**
 * 添加根據收款方式的條件驗證
 * @param schema 基本 schema
 * @returns 添加了條件驗證的 schema
 */
export function addReceiptTypeValidation<T extends z.ZodType>(schema: T) {
	return schema.superRefine((data, ctx) => {
		// 根據 receiptType 進行條件驗證
		switch (data.receiptType) {
			case RECEIPT_TYPES.LINK_PAY:
				// LinkPay 付款方式的驗證
				if (!data.email) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'LinkPay 付款方式必須填寫 Email',
						path: ['email']
					});
				}

				if (!data.receiptAccount) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'LinkPay 付款方式必須填寫收款帳號',
						path: ['receiptAccount']
					});
				}

				if (!data.payDateline) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'LinkPay 付款方式必須填寫付款截止日',
						path: ['payDateline']
					});
				}

				break;

			case RECEIPT_TYPES.BANK_TRANSFER:
				// 銀行轉帳付款方式的驗證
				if (!data.receiptAccount) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: '銀行轉帳付款方式必須填寫收款帳號',
						path: ['receiptAccount']
					});
				}

				break;

			// 可以添加其他付款方式的驗證
			default:
				// 默認不需要額外驗證
				break;
		}
	});
}

/**
 * 創建完整的收款 schema
 * @param options 配置選項
 * @returns 完整的 Zod schema
 */
export function createReceiptSchema(
	options: {
		includeReceiptNumber?: boolean;
		statusRequired?: boolean;
		includeActualAmount?: boolean;
	} = {}
) {
	const { includeReceiptNumber = false, statusRequired = false, includeActualAmount = false } = options;

	let schema = createBaseReceiptSchema({ includeReceiptNumber, statusRequired });

	// 如果需要包含實際金額
	if (includeActualAmount) {
		schema = schema.extend({
			actualAmount: z.number().min(0, '實際金額不能為負數')
		});
	}

	// 添加根據收款方式的條件驗證
	return addReceiptTypeValidation(schema);
}

/**
 * 創建批量創建收款的 schema
 */
export function createBatchReceiptSchema() {
	return z.object({
		orderNumber: z.string().min(1, '訂單編號不能為空'),
		receiptDate: z.union([z.string(), z.date()]),
		receiptType: z.string().min(1, '收款方式不能為空'),
		receiptItems: z
			.array(
				z.object({
					receiptAmount: z.number().min(1, '金額必須大於0'),
					receiptAccount: z.string().min(1, '收款帳號不能為空'),
					note: z.string().optional(),
					email: z.string().optional(),
					payDateline: z.union([z.string(), z.date(), z.null()]).optional()
				})
			)
			.min(1, '至少需要一組收款資料')
	});
}

/**
 * 創建收款項目的 schema
 * @param receiptType 收款方式
 * @returns Zod schema
 */
export function createReceiptItemSchema(receiptType: number) {
	const schema = z.object({
		receiptAccount: z.string().min(1, '請輸入收款帳號'),
		receiptAmount: z.number().min(1, '金額必須大於0'),
		note: z.string().optional(),
		paymentName: z.string().optional(),
		email: z
			.string()
			.optional()
			.refine(
				(val) => {
					if (val === undefined || val === null || val === '') {
						return true;
					}

					return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
				},
				{
					message: 'Email 格式不正確'
				}
			),
		payDateline: z.union([z.string(), z.date(), z.null()]).optional()
	});

	// 根據收款方式進行條件驗證
	return schema.superRefine((data, ctx) => {
		switch (receiptType) {
			case RECEIPT_TYPES.LINK_PAY:
				// LinkPay 付款方式的驗證
				if (!data.email) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'LinkPay 付款方式必須填寫 Email',
						path: ['email']
					});
				}

				if (!data.payDateline) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: 'LinkPay 付款方式必須填寫付款截止日',
						path: ['payDateline']
					});
				}

				break;

			// 其他收款方式不需要額外驗證
			default:
				break;
		}
	});
}
