'use client';

import { Controller, useFormContext } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import { MenuItem, Autocomplete, Chip } from '@mui/material';
import { useGetOrdersByGroupCodeQuery } from '@/app/(control-panel)/orders/OrderApi';
import { useGetGroupsQuery } from '@/app/(control-panel)/groups/GroupApi';
import { useGetUsersWithOutSessionQuery } from '@/app/(control-panel)/users/UserApi';
import { useGetSuppliersQuery } from '@/app/(control-panel)/suppliers/SupplierApi';
import { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import InvoiceItemsTable from '../components/InvoiceItemsTable';
import { INVOICE_STATUS_NAMES, INVOICE_STATUS_COLORS, INVOICE_STATUS } from '@/constants/invoiceStatus';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, setValue, watch } = methods;
	const { errors } = formState;
	const { data: groups = [] } = useGetGroupsQuery({
		excludeCompletedGroups: true
	});
	const { data: users = [] } = useGetUsersWithOutSessionQuery();
	const { data: suppliers = [] } = useGetSuppliersQuery();
	const { session, user } = useAuth();

	const isNewInvoice = !watch('invoiceNumber');
	const selectedGroupCode = watch('groupCode');
	const watchedInvoiceItems = watch('invoiceItems');

	// 使用 useMemo 包裝 invoiceItems 的初始化
	const invoiceItems = useMemo(() => watchedInvoiceItems || [], [watchedInvoiceItems]);
	const invoiceNumber = watch('invoiceNumber');
	const status = watch('status');

	// 新增：檢查發票是否為已出帳狀態（狀態為2）
	const isInvoiceBilled = status === INVOICE_STATUS.BILLED; // 或使用 INVOICE_STATUS.BILLED

	// 使用已實作的 API 查詢特定團號的訂單
	const { data: filteredOrders = [] } = useGetOrdersByGroupCodeQuery(
		selectedGroupCode || '',
		{ skip: !selectedGroupCode } // 如果沒有選擇團號，則跳過查詢
	);

	// 計算總金額
	const totalAmount = useMemo(() => {
		if (!invoiceItems || invoiceItems.length === 0) return 0;

		return invoiceItems.reduce((sum, item) => {
			return sum + item.price * item.quantity;
		}, 0);
	}, [invoiceItems]);

	// 當 invoiceItems 變更時，更新 amount 欄位
	useEffect(() => {
		setValue('amount', totalAmount);
	}, [totalAmount, setValue]);

	// 如果是新增發票，自動設定請款人為當前登入用戶
	useEffect(() => {
		if (isNewInvoice && user?.id) {
			setValue('createdBy', user.id);
		}
	}, [isNewInvoice, session, setValue]);

	// 當團號變更時，清空訂單編號
	useEffect(() => {
		setValue('orderNumber', '');
	}, [selectedGroupCode, setValue]);

	// 當訂單資料載入完成後，檢查當前的 orderNumber 是否有效
	// 如果無效，則嘗試設置為第一個訂單的編號
	useEffect(() => {
		const currentOrderNumber = watch('orderNumber');

		if (filteredOrders.length > 0) {
			// 檢查當前的訂單編號是否存在於過濾後的訂單列表中
			const orderExists =
				currentOrderNumber && filteredOrders.some((order) => order.orderNumber === currentOrderNumber);

			if (!orderExists) {
				// 如果當前沒有有效的訂單編號，則設置為第一個訂單的編號
				setValue('orderNumber', filteredOrders[0].orderNumber);
			}
		}
	}, [filteredOrders, setValue, watch]);

	// 檢查 createdBy 是否在有效的選項中
	useEffect(() => {
		const currentCreatedBy = watch('createdBy');

		if (currentCreatedBy && users.length > 0) {
			// 檢查當前選擇的用戶 ID 是否存在於用戶列表中
			const userExists = users.some((user) => user.id === currentCreatedBy);

			if (!userExists) {
				// 如果不存在，則清空請款人欄位
				setValue('createdBy', '');
			}
		}
	}, [users, setValue, watch]);

	const groupOptions = groups.map((group) => ({
		id: group.groupCode,
		label: `${group.groupCode} - ${group.groupName}`
	}));

	// 處理請款項目變更
	const handleInvoiceItemsChange = (newItems) => {
		setValue('invoiceItems', newItems, { shouldDirty: true });
	};

	return (
		<div className="space-y-8">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
				<Controller
					name="groupCode"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							options={groupOptions}
							getOptionLabel={(option) => {
								if (typeof option === 'string') {
									return option;
								}

								return option?.label || '';
							}}
							value={
								field.value && groupOptions.length > 0
									? groupOptions.find((option) => option.id === field.value) || null
									: null
							}
							onChange={(_, newValue) => {
								field.onChange(newValue ? newValue.id : null);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="團號"
									variant="outlined"
									fullWidth
									error={!!errors.groupCode}
									helperText={errors?.groupCode?.message as string}
									required
								/>
							)}
							loading={groups.length === 0}
							loadingText="載入中..."
							disabled={isInvoiceBilled}
						/>
					)}
				/>

				<Controller
					name="orderNumber"
					control={control}
					render={({ field }) => {
						// 確保 field.value 在 filteredOrders 中存在，否則設為空字串
						const safeValue =
							field.value &&
							filteredOrders.length > 0 &&
							filteredOrders.some((order) => order.orderNumber === field.value)
								? field.value
								: '';

						return (
							<TextField
								{...field}
								value={safeValue} // 使用安全值
								label="訂單編號"
								select
								error={!!errors.orderNumber}
								helperText={errors?.orderNumber?.message as string}
								disabled={!selectedGroupCode || filteredOrders.length === 0 || isInvoiceBilled}
							>
								<MenuItem value="">
									<em>無</em>
								</MenuItem>
								{filteredOrders.length > 0 ? (
									filteredOrders.map((order) => (
										<MenuItem
											key={order.orderNumber}
											value={order.orderNumber}
										>
											{order.orderNumber} - {order.contactPerson}
										</MenuItem>
									))
								) : (
									<MenuItem
										disabled
										value=""
									>
										<em>載入中...</em>
									</MenuItem>
								)}
							</TextField>
						);
					}}
				/>

				<Controller
					name="invoiceDate"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="請款日期"
							format="yyyy-MM-dd"
							slotProps={{
								textField: {
									error: !!errors.invoiceDate,
									helperText: errors?.invoiceDate?.message as string,
									required: true
								}
							}}
							disabled={isInvoiceBilled}
						/>
					)}
				/>

				<Controller
					name="createdBy"
					control={control}
					render={({ field }) => {
						// 確保 field.value 在 users 中存在，否則設為空字串
						const safeValue =
							field.value && users.length > 0 && users.some((user) => user.id === field.value)
								? field.value
								: '';

						return (
							<TextField
								{...field}
								value={safeValue} // 使用安全值
								label="請款人"
								select
								error={!!errors.createdBy}
								helperText={errors?.createdBy?.message as string}
								required
								disabled={!isNewInvoice || users.length === 0 || isInvoiceBilled}
							>
								{users.length > 0 ? (
									users.map((user) => (
										<MenuItem
											key={user.id}
											value={user.id}
										>
											{user.displayName}
										</MenuItem>
									))
								) : (
									<MenuItem
										disabled
										value=""
									>
										<em>載入中...</em>
									</MenuItem>
								)}
							</TextField>
						);
					}}
				/>

				<Controller
					name="amount"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="金額"
							type="text"
							value={totalAmount.toLocaleString()}
							InputProps={{
								readOnly: true
							}}
							variant="filled"
							helperText="自動計算 (項目金額總和)"
						/>
					)}
				/>

				{!isNewInvoice && (
					<TextField
						label="狀態"
						InputProps={{
							readOnly: true,
							startAdornment: (
								<Chip
									label={INVOICE_STATUS_NAMES[status] || '未知狀態'}
									size="small"
									sx={{
										bgcolor: INVOICE_STATUS_COLORS[status] || 'default',
										color: 'white',
										mr: 1
									}}
								/>
							)
						}}
						variant="filled"
					/>
				)}
			</div>

			{/* 請款項目表格 */}
			<InvoiceItemsTable
				items={invoiceItems}
				onItemsChange={handleInvoiceItemsChange}
				invoiceNumber={invoiceNumber || ''}
				suppliers={suppliers}
				isDisabled={isInvoiceBilled}
			/>
		</div>
	);
}

export default BasicInfoTab;
