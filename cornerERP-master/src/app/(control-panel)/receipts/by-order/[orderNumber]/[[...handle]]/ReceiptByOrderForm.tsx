import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import FuseLoading from '@fuse/core/FuseLoading';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { RECEIPT_TYPE_OPTIONS, RECEIPT_TYPES } from 'src/constants/receiptTypes';
import { RECEIPT_STATUS_OPTIONS, RECEIPT_STATUS } from 'src/constants/receiptStatus';
import { ReceiptFormData } from './ReceiptByOrder';
import { useDialogClose } from 'src/hooks/useDialogClose';
import { useEffect } from 'react';

type ReceiptByOrderFormProps = {
	isLoading: boolean;
	onClose: () => void;
	isValid: boolean;
	isDirty: boolean;
	isCreating: boolean;
};

function ReceiptByOrderForm({ isLoading, onClose, isValid, isDirty, isCreating }: ReceiptByOrderFormProps) {
	const {
		control,
		formState: { errors },
		watch,
		trigger
	} = useFormContext<ReceiptFormData>();

	// 使用自定義 Hook 處理對話框關閉
	const handleClose = useDialogClose(onClose);

	// 監控 receiptType 的值，確保它始終有值
	const receiptType = watch('receiptType') ?? RECEIPT_TYPES.BANK_TRANSFER;

	// 當 receiptType 變更時，觸發表單驗證
	useEffect(() => {
		trigger();
	}, [receiptType, trigger]);

	return (
		<>
			<DialogContent>
				{isLoading ? (
					<FuseLoading />
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Controller
							name="receiptNumber"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="收據編號"
									variant="outlined"
									fullWidth
									disabled
									error={!!errors.receiptNumber}
									helperText={errors.receiptNumber?.message}
									value={field.value ?? ''}
								/>
							)}
						/>
						<Controller
							name="orderNumber"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="訂單編號"
									variant="outlined"
									fullWidth
									disabled
									error={!!errors.orderNumber}
									helperText={errors.orderNumber?.message}
									value={field.value ?? ''}
								/>
							)}
						/>
						<Controller
							name="receiptDate"
							control={control}
							render={({ field }) => (
								<DatePicker
									{...field}
									label="收據日期"
									format="yyyy-MM-dd"
									value={field.value ? new Date(field.value) : null}
									slotProps={{
										textField: {
											fullWidth: true,
											required: true,
											error: !!errors.receiptDate,
											helperText: errors?.receiptDate?.message
										}
									}}
								/>
							)}
						/>
						<Controller
							name="receiptType"
							control={control}
							render={({ field }) => (
								<FormControl
									fullWidth
									error={!!errors.receiptType}
								>
									<InputLabel>收款方式</InputLabel>
									<Select
										{...field}
										value={field.value ?? RECEIPT_TYPES.BANK_TRANSFER} // 確保始終有值
										label="收款方式"
										required
									>
										{RECEIPT_TYPE_OPTIONS.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Select>
									{errors.receiptType && (
										<FormHelperText>{errors.receiptType.message}</FormHelperText>
									)}
								</FormControl>
							)}
						/>
						<Controller
							name="receiptAmount"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									required
									type="number"
									label="收款金額"
									variant="outlined"
									fullWidth
									error={!!errors.receiptAmount}
									helperText={errors?.receiptAmount?.message}
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value;
										field.onChange(value ? Number(value) : 0);
									}}
								/>
							)}
						/>
						<Controller
							name="actualAmount"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									required
									type="number"
									label="實收金額"
									variant="outlined"
									fullWidth
									error={!!errors.actualAmount}
									helperText={errors?.actualAmount?.message}
									value={field.value ?? ''}
									onChange={(e) => {
										const value = e.target.value;
										field.onChange(value ? Number(value) : 0);
									}}
								/>
							)}
						/>
						{/* 根據收款方式條件顯示欄位 */}
						{receiptType === RECEIPT_TYPES.BANK_TRANSFER && (
							<Controller
								name="receiptAccount"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="收款帳號"
										variant="outlined"
										fullWidth
										required
										value={field.value ?? ''}
										error={!!errors.receiptAccount}
										helperText={
											errors?.receiptAccount?.message || '銀行轉帳付款方式必須填寫收款帳號'
										}
									/>
								)}
							/>
						)}
						{receiptType === RECEIPT_TYPES.LINK_PAY && (
							<>
								<Controller
									name="receiptAccount"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="收款帳號"
											variant="outlined"
											fullWidth
											required
											value={field.value ?? ''}
											error={!!errors.receiptAccount}
											helperText={
												errors?.receiptAccount?.message || 'LinkPay 付款方式必須填寫收款帳號'
											}
										/>
									)}
								/>
								<Controller
									name="email"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="電子郵件"
											type="email"
											variant="outlined"
											fullWidth
											required
											value={field.value ?? ''}
											error={!!errors.email}
											helperText={errors?.email?.message || 'LinkPay 付款方式必須填寫 Email'}
										/>
									)}
								/>
								<Controller
									name="payDateline"
									control={control}
									render={({ field }) => (
										<DatePicker
											{...field}
											label="付款截止日"
											format="yyyy-MM-dd"
											value={field.value ? new Date(field.value) : null}
											slotProps={{
												textField: {
													fullWidth: true,
													required: true,
													error: !!errors.payDateline,
													helperText:
														errors?.payDateline?.message ||
														'LinkPay 付款方式必須填寫付款截止日'
												}
											}}
										/>
									)}
								/>
							</>
						)}
						<Controller
							name="status"
							control={control}
							defaultValue={RECEIPT_STATUS.PENDING}
							render={({ field }) => (
								<FormControl
									fullWidth
									error={!!errors.status}
								>
									<InputLabel>狀態</InputLabel>
									<Select
										{...field}
										value={field.value ?? RECEIPT_STATUS.PENDING}
										label="狀態"
										required
									>
										{RECEIPT_STATUS_OPTIONS.map((option) => (
											<MenuItem
												key={option.value}
												value={option.value}
											>
												{option.label}
											</MenuItem>
										))}
									</Select>
									{errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
								</FormControl>
							)}
						/>
						<Controller
							name="note"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="備註"
									variant="outlined"
									fullWidth
									multiline
									rows={4}
									value={field.value ?? ''}
									error={!!errors.note}
									helperText={errors?.note?.message}
									className="col-span-2"
								/>
							)}
						/>
					</div>
				)}
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleClose}
					color="inherit"
				>
					取消
				</Button>
				<Button
					type="submit"
					color="primary"
					disabled={isLoading || !isValid || !isDirty || isCreating}
				>
					<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>
					<span className="mx-1">儲存</span>
				</Button>
			</DialogActions>
		</>
	);
}

export default ReceiptByOrderForm;
