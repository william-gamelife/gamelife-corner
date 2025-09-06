import TextField from '@mui/material/TextField';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Autocomplete, Box, Typography, Divider, Chip } from '@mui/material';
import { useGetOrdersQuery } from '@/app/(control-panel)/orders/OrderApi';
import { RECEIPT_TYPE_OPTIONS, RECEIPT_TYPES } from 'src/constants/receiptTypes';
import { RECEIPT_STATUS_NAMES, RECEIPT_STATUS_COLORS } from 'src/constants/receiptStatus';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import LinkPayExpandableRow from '@/app/(control-panel)/receipts/LinkPayExpandableRow';
import { useState } from 'react';
import authRoles from '@auth/authRoles';
import FuseUtils from '@fuse/utils';
import useUser from '@auth/useUser';

function BasicInfoTab() {
	const { data: user } = useUser();
	const userRole = user?.roles;
	const methods = useFormContext();
	const { control, formState, getValues, watch } = methods;
	const { errors } = formState;
	const [linkPayInfoOpen, setLinkPayInfoOpen] = useState(false);
	const [refreshKey, setRefreshKey] = useState(0); // 用於強制重新獲取數據

	// 監控 receiptType 以條件性顯示欄位
	const receiptType = useWatch({
		control,
		name: 'receiptType'
	});

	// 監控收據狀態
	// const receiptStatus = useWatch({
	// 	control,
	// 	name: 'status'
	// });

	const status = watch('status');

	const { data: orders = [] } = useGetOrdersQuery({});

	const orderOptions = orders.map((order) => ({
		id: order.orderNumber,
		label: `${order.orderNumber} - ${order.groupName} - ${order.contactPerson}`
	}));

	// 獲取表單中的 linkpay 資訊
	const formValues = getValues();
	const hasLinkPayInfo = receiptType === RECEIPT_TYPES.LINK_PAY;

	// 檢查是否為新收據
	const isNewReceipt = !formValues.receiptNumber || formValues.receiptNumber === 'new';

	// 處理 LinkPay 創建成功後的回調
	const handleLinkPayCreated = () => {
		// 強制重新獲取數據
		setRefreshKey((prev) => prev + 1);
		// 這裡可以添加其他邏輯，例如重新獲取收據數據
	};

	// 在表單中添加狀態顯示
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Controller
					name="receiptNumber"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="收款單號"
							autoFocus
							variant="outlined"
							fullWidth
							disabled
						/>
					)}
				/>

				<Controller
					name="orderNumber"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							options={orderOptions}
							getOptionLabel={(option) => {
								if (typeof option === 'string') {
									return option;
								}

								return option.label;
							}}
							value={
								field.value ? orderOptions.find((option) => option.id === field.value) || null : null
							}
							onChange={(_, newValue) => {
								field.onChange(newValue ? newValue.id : null);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="訂單編號"
									variant="outlined"
									fullWidth
									error={!!errors.orderNumber}
									helperText={errors?.orderNumber?.message as string}
									required
								/>
							)}
						/>
					)}
				/>

				<Controller
					name="receiptType"
					control={control}
					defaultValue={-1}
					render={({ field }) => (
						<FormControl
							fullWidth
							error={!!errors.receiptType}
						>
							<InputLabel>付款方式</InputLabel>
							<Select
								{...field}
								value={field.value ?? -1}
								label="付款方式"
								required
							>
								<MenuItem value={-1}>請選擇付款方式</MenuItem>
								{RECEIPT_TYPE_OPTIONS.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</MenuItem>
								))}
							</Select>
							{errors.receiptType && <FormHelperText>{errors.receiptType.message}</FormHelperText>}
						</FormControl>
					)}
				/>

				<Controller
					name="receiptDate"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="收款日期"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : null}
							slotProps={{
								textField: {
									fullWidth: true,
									required: true,
									error: !!errors.receiptDate,
									helperText: errors?.receiptDate?.message as string
								}
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
								error={!!errors.receiptAccount}
								helperText={errors?.receiptAccount?.message as string}
								required
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
									label="姓名"
									variant="outlined"
									fullWidth
									error={!!errors.receiptAccount}
									helperText={errors?.receiptAccount?.message as string}
									required
								/>
							)}
						/>

						<Controller
							name="paymentName"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="付款名稱"
									variant="outlined"
									fullWidth
									error={!!errors.paymentName}
									helperText={errors?.paymentName?.message as string}
								/>
							)}
						/>
						<Controller
							name="email"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="信箱"
									type="email"
									variant="outlined"
									fullWidth
									error={!!errors.email}
									helperText={errors?.email?.message as string}
									required
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
											helperText: errors?.payDateline?.message as string
										}
									}}
								/>
							)}
						/>
					</>
				)}

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
							helperText={errors?.receiptAmount?.message as string}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value ? Number(value) : null);
							}}
						/>
					)}
				/>

				<Controller
					name="actualAmount"
					control={control}
					defaultValue={0}
					render={({ field }) => (
						<TextField
							{...field}
							type="number"
							label="實收金額"
							variant="outlined"
							disabled={
								receiptType === RECEIPT_TYPES.LINK_PAY ||
								!FuseUtils.hasPermission(authRoles.accountant, userRole)
							}
							fullWidth
							value={field.value}
							onChange={(e) => {
								const value = e.target.value;
								field.onChange(value ? Number(value) : null);
							}}
						/>
					)}
				/>

				{!isNewReceipt && (
					<TextField
						label="狀態"
						InputProps={{
							readOnly: true,
							startAdornment: (
								<Chip
									label={RECEIPT_STATUS_NAMES[status] || '未知狀態'}
									size="small"
									color={RECEIPT_STATUS_COLORS[status] || 'default'}
									sx={{
										color: 'white',
										mr: 1
									}}
								/>
							)
						}}
						variant="filled"
					/>
				)}

				<Controller
					name="note"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="說明"
							variant="outlined"
							fullWidth
							multiline
							rows={4}
							error={!!errors.note}
							helperText={errors?.note?.message as string}
						/>
					)}
				/>
			</div>

			{/* LinkPay 資訊區塊 */}
			{hasLinkPayInfo && !isNewReceipt && (
				<div
					className="mt-6"
					key={refreshKey}
				>
					<Divider className="mb-4" />
					<Box className="flex justify-between items-center mb-2">
						<Typography
							variant="h6"
							className="font-medium"
						>
							LinkPay 付款資訊
						</Typography>
					</Box>
					<LinkPayExpandableRow
						receipt={formValues}
						linkpayData={
							Array.isArray(formValues.linkpay)
								? formValues.linkpay
								: formValues.linkpay
									? [formValues.linkpay]
									: []
						}
						paymentName={formValues.paymentName}
						open={true}
						onToggle={() => setLinkPayInfoOpen(!linkPayInfoOpen)}
						onLinkPayCreated={handleLinkPayCreated}
					/>
				</div>
			)}
		</div>
	);
}

export default BasicInfoTab;
