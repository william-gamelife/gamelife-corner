'use client';

import React, { useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Stack, Box } from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DatePicker } from '@mui/x-date-pickers';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { useDialogClose } from 'src/hooks/useDialogClose';
import { createReceiptItemSchema } from '../../schemas/receiptSchema';

// 使用 Zod 替代 Yup 的表單驗證規則
// const schema = addReceiptTypeValidation(
// 	z.object({
// 		receiptType:z.nativeEnum(RECEIPT_TYPES),
// 		receiptAccount: z.string().min(1, '請輸入收款帳號'),
// 		receiptAmount: z.number().min(1, '金額必須大於0'),
// 		note: z.string().optional(),
// 		email: z.string().optional().refine(
// 			(val) => {
// 				if (val === undefined || val === null || val === '') {
// 					return true;
// 				}
// 				return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
// 			},
// 			{
// 				message: 'Email 格式不正確'
// 			}
// 		),
// 		payDateline: z.union([z.string(), z.date(), z.null()]).optional()
// 	})
// );

export type ReceiptItemFormData = {
	receiptType: number;
	receiptAccount: string;
	receiptAmount: number;
	note?: string;
	email?: string;
	paymentName?: string;
	payDateline?: Date | null;
};

interface ReceiptItemDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (item: ReceiptItemFormData) => void;
	editingItem: ReceiptItemFormData | null;
	receiptType: number;
}

const ReceiptItemDialog: React.FC<ReceiptItemDialogProps> = ({
	open,
	onClose,
	onSave,
	editingItem,
	receiptType: defaultReceiptType
}) => {
	const schema = createReceiptItemSchema(defaultReceiptType);
	const methods = useForm<ReceiptItemFormData>({
		mode: 'onChange',
		resolver: zodResolver(schema),
		defaultValues: {
			receiptType: defaultReceiptType,
			receiptAccount: editingItem?.receiptAccount || '',
			receiptAmount: editingItem?.receiptAmount || 0,
			note: editingItem?.note || '',
			email: editingItem?.email || '',
			paymentName: editingItem?.paymentName || '',
			payDateline: editingItem?.payDateline ? new Date(editingItem.payDateline) : null
		},
		context: { receiptType: defaultReceiptType }
	});

	// 當編輯項目變化時，重置表單
	useEffect(() => {
		if (open) {
			methods.reset({
				receiptType: defaultReceiptType,
				receiptAccount: editingItem?.receiptAccount || '',
				receiptAmount: editingItem?.receiptAmount || 0,
				note: editingItem?.note || '',
				email: editingItem?.email || '',
				paymentName: editingItem?.paymentName || '',
				payDateline: editingItem?.payDateline ? new Date(editingItem.payDateline) : null
			});
		}
	}, [open, editingItem, methods.reset]);

	const onSubmit = (data: ReceiptItemFormData) => {
		onSave(data);
		onClose();
	};

	// 使用自定義 Hook 處理對話框關閉
	const handleClose = useDialogClose(onClose);

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{editingItem ? '編輯收款項目' : '新增收款項目'}</DialogTitle>
			<DialogContent>
				<form
					id="receipt-item-form"
					onSubmit={methods.handleSubmit(onSubmit)}
				>
					<Stack
						spacing={2}
						sx={{ mt: 2 }}
					>
						<Box>
							<Controller
								name="receiptAccount"
								control={methods.control}
								render={({ field }) => (
									<TextField
										{...field}
										label={
											defaultReceiptType === RECEIPT_TYPES.LINK_PAY
												? '收款對象(五字內)'
												: '收款帳號'
										}
										fullWidth
										error={!!methods.formState.errors.receiptAccount}
										helperText={methods.formState.errors.receiptAccount?.message}
									/>
								)}
							/>
						</Box>
						<Box>
							<Controller
								name="receiptAmount"
								control={methods.control}
								render={({ field }) => (
									<TextField
										{...field}
										label="金額"
										type="number"
										fullWidth
										error={!!methods.formState.errors.receiptAmount}
										helperText={methods.formState.errors.receiptAmount?.message}
										InputProps={{
											inputProps: { min: 1 }
										}}
										onChange={(e) => field.onChange(Number(e.target.value))}
									/>
								)}
							/>
						</Box>

						{defaultReceiptType === RECEIPT_TYPES.LINK_PAY && (
							<>
								<Box>
									<Controller
										name="email"
										control={methods.control}
										render={({ field }) => (
											<TextField
												{...field}
												label="信箱"
												type="email"
												fullWidth
												error={!!methods.formState.errors.email}
												helperText={methods.formState.errors.email?.message}
											/>
										)}
									/>
								</Box>

								<Box>
									<Controller
										name="paymentName"
										control={methods.control}
										render={({ field }) => (
											<TextField
												{...field}
												label="收款名稱(顯示)"
												fullWidth
												error={!!methods.formState.errors.paymentName}
												helperText={methods.formState.errors.paymentName?.message}
											/>
										)}
									/>
								</Box>
								<Box>
									<Controller
										name="payDateline"
										control={methods.control}
										render={({ field }) => (
											<DatePicker
												{...field}
												label="付款截止日"
												format="yyyy-MM-dd"
												value={field.value ? new Date(field.value) : null}
												slotProps={{
													textField: {
														fullWidth: true,
														error: !!methods.formState.errors.payDateline,
														helperText: methods.formState.errors.payDateline?.message
													}
												}}
											/>
										)}
									/>
								</Box>
							</>
						)}

						<Box>
							<Controller
								name="note"
								control={methods.control}
								render={({ field }) => (
									<TextField
										{...field}
										label="備註"
										fullWidth
										multiline
										rows={3}
										error={!!methods.formState.errors.note}
										helperText={methods.formState.errors.note?.message}
									/>
								)}
							/>
						</Box>
					</Stack>
				</form>
			</DialogContent>
			<DialogActions>
				<Button onClick={handleClose}>取消</Button>
				<Button
					type="submit"
					form="receipt-item-form"
					variant="contained"
					color="primary"
				>
					儲存
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default ReceiptItemDialog;
