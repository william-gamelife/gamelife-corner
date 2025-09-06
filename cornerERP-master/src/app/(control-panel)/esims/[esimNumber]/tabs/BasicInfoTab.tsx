import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import {
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Autocomplete,
	Chip,
	InputAdornment,
	IconButton
} from '@mui/material';
import { Search as SearchIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { ESIM_STATUS_COLORS, ESIM_STATUS_NAMES } from '@/constants/esimStatuses';
import {
	useLazyGetFastMoveProductsQuery,
	useQueryFastMoveOrderDetailMutation
} from '@/app/api/supabase/fast-move/FastMoveApi';
import { useMemo, useEffect, useState } from 'react';
import { FastMoveProduct, FastMoveOrderDetail } from '@/app/api/supabase/fast-move/types';
import { useGetGroupsQuery } from '@/app/(control-panel)/groups/GroupApi';
import { useGetOrdersByGroupCodeQuery } from '@/app/(control-panel)/orders/OrderApi';
import CreateOrderDialog from '../../components/CreateOrderDialog';
import OrderDetailDialog from '../../components/OrderDetailDialog';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, watch, setValue } = methods;
	const { errors } = formState;
	const [createOrderDialogOpen, setCreateOrderDialogOpen] = useState(false);
	const [orderDetailDialogOpen, setOrderDetailDialogOpen] = useState(false);
	const [orderDetailData, setOrderDetailData] = useState<FastMoveOrderDetail | null>(null);
	const [orderDetailError, setOrderDetailError] = useState<string | null>(null);

	// 判斷是否為新增模式
	const isNewMode = window.location.pathname.includes('/new');

	// 監聽選擇的地區和團號
	const selectedRegion = watch('productRegion');
	const selectedGroupCode = watch('groupCode');
	const status = watch('status');
	const supplierOrderNumber = watch('supplierOrderNumber');
	// 取得團號資料
	const { data: groups = [] } = useGetGroupsQuery();

	// 使用已實作的 API 查詢特定團號的訂單
	const { data: filteredOrders = [] } = useGetOrdersByGroupCodeQuery(
		selectedGroupCode || '',
		{ skip: !selectedGroupCode } // 如果沒有選擇團號，則跳過查詢
	);

	// 取得 FastMove 產品資料 (使用 lazy query)
	const [getFastMoveProducts, { data: fastMoveData, isLoading: isFastMoveLoading, error: fastMoveError }] =
		useLazyGetFastMoveProductsQuery();

	// 查詢訂單詳細資訊的 mutation
	const [queryOrderDetail, { isLoading: isQueryingOrderDetail }] = useQueryFastMoveOrderDetailMutation();

	// 移除初始查詢，利用 EsimHeader 中的 useGetFastMoveProductsQuery 共享快取
	// 只在強制刷新時才手動呼叫

	// 取得唯一的地區列表
	const uniqueRegions = useMemo(() => {
		if (!fastMoveData?.success || !fastMoveData.data?.prodList) return [];

		const regions = fastMoveData.data.prodList.map((product: FastMoveProduct) => product.productRegion);
		return [...new Set(regions)].sort();
	}, [fastMoveData]);

	// 根據選擇的地區過濾產品
	const filteredProducts = useMemo(() => {
		if (!fastMoveData?.success || !fastMoveData.data?.prodList || !selectedRegion) return [];

		return fastMoveData.data.prodList.filter(
			(product: FastMoveProduct) => product.productRegion === selectedRegion
		);
	}, [fastMoveData, selectedRegion]);

	// 當地區改變時，清空產品選擇（僅在新增模式下）
	const handleRegionChange = (region: string) => {
		setValue('productRegion', region);

		if (isNewMode) {
			setValue('wmproductId', '');
			setValue('productId', '');
		}
	};

	// 當產品選擇改變時，同時設定 productId（僅在新增模式下）
	const handleProductChange = (wmproductId: string) => {
		if (isNewMode) {
			setValue('wmproductId', wmproductId);
			setValue('productId', wmproductId); // 將 wmproductId 設定為 productId
		}
	};

	// 當團號變更時，清空訂單編號（僅在新增模式下）
	useEffect(() => {
		// 只有在新增模式下才清空訂單編號
		if (isNewMode) {
			setValue('orderNumber', '');
		}
	}, [selectedGroupCode, setValue, isNewMode]);

	// 當訂單資料載入完成後，檢查當前的 orderNumber 是否有效
	// 如果無效且在新增模式下，則嘗試設置為第一個訂單的編號
	useEffect(() => {
		const currentOrderNumber = watch('orderNumber');

		if (filteredOrders.length > 0 && isNewMode) {
			// 檢查當前的訂單編號是否存在於過濾後的訂單列表中
			const orderExists =
				currentOrderNumber && filteredOrders.some((order) => order.orderNumber === currentOrderNumber);

			if (!orderExists) {
				// 如果當前沒有有效的訂單編號，則設置為第一個訂單的編號
				setValue('orderNumber', filteredOrders[0].orderNumber);
			}
		}
	}, [filteredOrders, setValue, watch, isNewMode]);

	// 處理新增訂單
	const handleOrderCreated = (orderNumber: string) => {
		// 設置新創建的訂單編號
		setValue('orderNumber', orderNumber);
	};

	// 處理強制刷新產品清單
	const handleRefreshProducts = async () => {
		// 強制刷新：傳送 forceRefresh: true 參數
		await getFastMoveProducts({ forceRefresh: true });
	};

	// 處理查詢訂單詳細資訊
	const handleQueryOrderDetail = async () => {
		if (!supplierOrderNumber) {
			setOrderDetailError('供應商訂單編號不能為空');
			return;
		}

		try {
			setOrderDetailError(null);
			setOrderDetailData(null);
			setOrderDetailDialogOpen(true);

			const result = await queryOrderDetail({ orderNumber: supplierOrderNumber }).unwrap();

			if (result.success && result.data) {
				setOrderDetailData(result.data);
			} else {
				setOrderDetailError(result.message || '查詢失敗');
			}
		} catch (error) {
			console.error('查詢訂單詳細資訊失敗:', error);
			setOrderDetailError('查詢失敗，請稍後再試');
		}
	};

	const groupOptions = groups.map((group) => ({
		id: group.groupCode,
		label: `${group.groupCode} - ${group.groupName}`
	}));

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Controller
					name="groupCode"
					control={control}
					render={({ field }) => {
						if (isNewMode) {
							// 新增模式：顯示可選擇的 Autocomplete
							return (
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
								/>
							);
						} else {
							// 編輯模式：顯示不可編輯的文字欄位
							const selectedGroup = groupOptions.find((option) => option.id === field.value);
							const displayValue = selectedGroup ? selectedGroup.label : field.value || '';

							return (
								<TextField
									{...field}
									value={displayValue}
									label="團號"
									variant="outlined"
									fullWidth
									error={!!errors.groupCode}
									helperText={errors?.groupCode?.message as string}
									disabled
									InputProps={{
										readOnly: true
									}}
								/>
							);
						}
					}}
				/>

				<Controller
					name="orderNumber"
					control={control}
					render={({ field }) => {
						if (isNewMode) {
							// 新增模式：顯示可選擇的 Autocomplete 並添加新增按鈕
							// 對訂單按編號排序
							const sortedOrders = [...filteredOrders].sort((a, b) =>
								a.orderNumber.localeCompare(b.orderNumber)
							);

							const orderOptions = [
								...sortedOrders.map((order) => ({
									id: order.orderNumber,
									label: `${order.orderNumber} - ${order.contactPerson}`,
									type: 'order' as const
								})),
								// 在最下面添加新增訂單選項
								{
									id: '__ADD_NEW_ORDER__',
									label: '新增訂單',
									type: 'action' as const
								}
							];

							return (
								<Autocomplete
									{...field}
									options={orderOptions}
									getOptionLabel={(option) => {
										if (typeof option === 'string') {
											return option;
										}

										return option?.label || '';
									}}
									value={
										field.value && orderOptions.length > 0
											? orderOptions.find(
													(option) => option.id === field.value && option.type === 'order'
												) || null
											: null
									}
									onChange={(_, newValue) => {
										if (newValue?.type === 'action' && newValue.id === '__ADD_NEW_ORDER__') {
											// 點擊新增訂單選項
											setCreateOrderDialogOpen(true);
										} else {
											field.onChange(newValue ? newValue.id : '');
										}
									}}
									renderOption={(props, option) => (
										<li
											{...props}
											key={option.id}
										>
											<span
												style={{
													color: option.type === 'action' ? '#1976d2' : 'inherit',
													fontWeight: option.type === 'action' ? 500 : 'normal'
												}}
											>
												{option.label}
											</span>
										</li>
									)}
									renderInput={(params) => (
										<TextField
											{...params}
											label="訂單編號"
											variant="outlined"
											fullWidth
											error={!!errors.orderNumber}
											helperText={
												(errors?.orderNumber?.message as string) ||
												(!selectedGroupCode ? '請先選擇團號' : '')
											}
											required
										/>
									)}
									loading={filteredOrders.length === 0 && selectedGroupCode}
									loadingText="載入訂單資料中..."
									disabled={!selectedGroupCode}
									noOptionsText={selectedGroupCode ? '沒有符合的訂單' : '請先選擇團號'}
								/>
							);
						} else {
							// 編輯模式：顯示不可編輯的文字欄位
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
									variant="outlined"
									fullWidth
									error={!!errors.orderNumber}
									helperText={errors?.orderNumber?.message as string}
									disabled
									InputProps={{
										readOnly: true
									}}
								/>
							);
						}
					}}
				/>

				{/* 產品地區選擇 */}
				<Controller
					name="productRegion"
					control={control}
					render={({ field }) => {
						if (isNewMode) {
							// 新增模式：顯示可選擇的下拉選單
							return (
								<FormControl
									fullWidth
									error={!!errors.productRegion}
									disabled={isFastMoveLoading}
								>
									<InputLabel>產品地區</InputLabel>
									<Select
										{...field}
										value={field.value || ''}
										label="產品地區"
										onChange={(e) => handleRegionChange(e.target.value)}
										endAdornment={
											<InputAdornment position="end">
												<IconButton
													onClick={handleRefreshProducts}
													disabled={isFastMoveLoading}
													title="強制刷新產品清單"
													size="small"
													sx={{ mr: 1 }}
												>
													<RefreshIcon
														sx={{
															animation: isFastMoveLoading
																? 'spin 1s linear infinite'
																: 'none',
															'@keyframes spin': {
																'0%': { transform: 'rotate(0deg)' },
																'100%': { transform: 'rotate(360deg)' }
															}
														}}
													/>
												</IconButton>
											</InputAdornment>
										}
									>
										{uniqueRegions.map((region) => (
											<MenuItem
												key={region}
												value={region}
											>
												{region}
											</MenuItem>
										))}
									</Select>
									{errors.productRegion && (
										<FormHelperText error>{String(errors.productRegion.message)}</FormHelperText>
									)}
									{isFastMoveLoading && <FormHelperText>載入產品資料中...</FormHelperText>}
									{fastMoveError && <FormHelperText error>載入產品資料失敗</FormHelperText>}
								</FormControl>
							);
						} else {
							// 編輯模式：顯示不可編輯的文字欄位
							return (
								<TextField
									{...field}
									value={field.value || ''}
									label="產品地區"
									variant="outlined"
									fullWidth
									error={!!errors.productRegion}
									helperText={
										(errors.productRegion?.message as string) ||
										(isFastMoveLoading ? '載入產品資料中...' : '') ||
										(fastMoveError ? '載入產品資料失敗' : '')
									}
									disabled
									InputProps={{
										readOnly: true,
										endAdornment: (
											<InputAdornment position="end">
												<IconButton
													onClick={handleRefreshProducts}
													disabled={isFastMoveLoading}
													title="強制刷新產品清單"
													size="small"
												>
													<RefreshIcon
														sx={{
															animation: isFastMoveLoading
																? 'spin 1s linear infinite'
																: 'none',
															'@keyframes spin': {
																'0%': { transform: 'rotate(0deg)' },
																'100%': { transform: 'rotate(360deg)' }
															}
														}}
													/>
												</IconButton>
											</InputAdornment>
										)
									}}
								/>
							);
						}
					}}
				/>

				{/* 產品選擇 */}
				<Controller
					name="productId"
					control={control}
					render={({ field }) => {
						// 根據 productId 找到對應的產品資訊來顯示
						const selectedProduct =
							fastMoveData?.success && fastMoveData.data?.prodList
								? fastMoveData.data.prodList.find(
										(product: FastMoveProduct) => product.wmproductId === field.value
									)
								: null;

						if (isNewMode) {
							// 新增模式：顯示可選擇的 Autocomplete
							return (
								<Autocomplete
									{...field}
									options={filteredProducts}
									getOptionLabel={(option) => {
										if (typeof option === 'string') {
											return option;
										}

										return option ? `${option.productName} - $${option.productPrice}` : '';
									}}
									value={
										field.value && filteredProducts.length > 0
											? filteredProducts.find((product) => product.wmproductId === field.value) ||
												null
											: null
									}
									onChange={(_, newValue) => {
										handleProductChange(newValue ? newValue.wmproductId : '');
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="產品"
											variant="outlined"
											fullWidth
											error={!!errors.wmproductId || !!errors.productId}
											helperText={
												((errors.wmproductId?.message ||
													errors.productId?.message) as string) ||
												(isFastMoveLoading ? '載入產品資料中...' : '') ||
												(!selectedRegion ? '請先選擇產品地區' : '')
											}
											required
										/>
									)}
									loading={isFastMoveLoading}
									loadingText="載入產品資料中..."
									disabled={!selectedRegion || isFastMoveLoading}
									noOptionsText={selectedRegion ? '沒有符合的產品' : '請先選擇產品地區'}
								/>
							);
						} else {
							// 編輯模式：顯示不可編輯的文字欄位
							const displayValue = selectedProduct
								? `${selectedProduct.productName} - $${selectedProduct.productPrice}`
								: field.value || '';

							return (
								<TextField
									{...field}
									value={displayValue}
									label="產品"
									variant="outlined"
									fullWidth
									error={!!errors.wmproductId || !!errors.productId}
									helperText={
										((errors.wmproductId?.message || errors.productId?.message) as string) ||
										(isFastMoveLoading ? '載入產品資料中...' : '')
									}
									disabled
									InputProps={{
										readOnly: true
									}}
								/>
							);
						}
					}}
				/>

				{/* 數量選擇 */}
				<Controller
					name="quantity"
					control={control}
					render={({ field }) => {
						if (isNewMode) {
							// 新增模式：顯示可選擇的下拉選單
							return (
								<FormControl
									fullWidth
									error={!!errors.quantity}
								>
									<InputLabel>數量</InputLabel>
									<Select
										{...field}
										value={field.value || 1}
										label="數量"
									>
										{Array.from({ length: 9 }, (_, i) => i + 1).map((num) => (
											<MenuItem
												key={num}
												value={num}
											>
												{num} 張
											</MenuItem>
										))}
									</Select>
									{errors.quantity && (
										<FormHelperText error>{String(errors.quantity.message)}</FormHelperText>
									)}
								</FormControl>
							);
						} else {
							// 編輯模式：顯示不可編輯的文字欄位
							return (
								<TextField
									{...field}
									value={`${field.value || 1} 張`}
									label="數量"
									variant="outlined"
									fullWidth
									error={!!errors.quantity}
									helperText={errors.quantity?.message as string}
									disabled
									InputProps={{
										readOnly: true
									}}
								/>
							);
						}
					}}
				/>

				<Controller
					name="email"
					control={control}
					render={({ field }) => {
						return (
							<TextField
								{...field}
								label="信箱"
								type="email"
								variant="outlined"
								fullWidth
								error={!!errors.email}
								helperText={errors?.email?.message as string}
								required={isNewMode}
								disabled={!isNewMode}
								InputProps={{
									readOnly: !isNewMode
								}}
							/>
						);
					}}
				/>

				{/* 備註欄位 */}
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
							rows={3}
							error={!!errors.note}
							helperText={errors?.note?.message as string}
							disabled={!isNewMode}
							InputProps={{
								readOnly: !isNewMode
							}}
							sx={{ gridColumn: 'span 2' }} // 讓備註欄位跨兩欄
						/>
					)}
				/>

				{/* 供應商訂單編號 - 僅在編輯模式顯示 */}
				{!isNewMode && (
					<Controller
						name="supplierOrderNumber"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="供應商訂單編號"
								variant="outlined"
								disabled
								fullWidth
								error={!!errors.supplierOrderNumber}
								helperText={errors?.supplierOrderNumber?.message as string}
								InputProps={{
									readOnly: true,
									endAdornment: field.value && (
										<InputAdornment position="end">
											<IconButton
												onClick={handleQueryOrderDetail}
												disabled={isQueryingOrderDetail || !field.value}
												title="查詢訂單詳細資訊"
												size="small"
											>
												<SearchIcon />
											</IconButton>
										</InputAdornment>
									)
								}}
							/>
						)}
					/>
				)}

				{/* 狀態 - 僅在編輯模式顯示 */}
				{!isNewMode && (
					<TextField
						label="狀態"
						fullWidth
						error={!!errors.status}
						helperText={errors?.status?.message as string}
						InputProps={{
							readOnly: true,
							startAdornment: (
								<Chip
									label={ESIM_STATUS_NAMES[status] || '未知狀態'}
									size="small"
									color={ESIM_STATUS_COLORS[status] || 'default'}
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
			</div>

			{/* 新增訂單對話框 */}
			<CreateOrderDialog
				open={createOrderDialogOpen}
				onClose={() => setCreateOrderDialogOpen(false)}
				selectedGroupCode={selectedGroupCode}
				onOrderCreated={handleOrderCreated}
			/>

			{/* 訂單詳細資訊對話框 */}
			<OrderDetailDialog
				open={orderDetailDialogOpen}
				onClose={() => setOrderDetailDialogOpen(false)}
				orderData={orderDetailData}
				loading={isQueryingOrderDetail}
				error={orderDetailError}
			/>
		</div>
	);
}

export default BasicInfoTab;
