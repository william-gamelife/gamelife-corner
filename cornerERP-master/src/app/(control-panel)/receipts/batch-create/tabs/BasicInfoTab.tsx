'use client';

import { Controller, useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import { DatePicker } from '@mui/x-date-pickers';
import {
	MenuItem,
	Button,
	IconButton,
	Paper,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Divider,
	Box,
	Typography,
	FormControl,
	InputLabel,
	Select,
	FormHelperText,
	Autocomplete
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { useGetOrdersForSelectQuery } from '@/app/(control-panel)/orders/OrderApi';
import { RECEIPT_TYPE_OPTIONS } from '@/constants/receiptTypes';
import { useMemo, useState } from 'react';
import ReceiptItemDialog, { ReceiptItemFormData } from '../components/ReceiptItemDialog';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState, setValue, watch } = methods;
	const { errors } = formState;

	const { data: orders = [] } = useGetOrdersForSelectQuery();

	// 使用 useFieldArray 管理多組收據項目
	const { fields, append, remove, update } = useFieldArray({
		control,
		name: 'receiptItems'
	});

	// 在使用 fields 時進行類型斷言
	const typedFields = fields as unknown as (ReceiptItemFormData & { id: string })[];

	const receiptItems = watch('receiptItems') || [];

	// 監控 receiptType 以條件性顯示欄位
	const receiptType = useWatch({
		control,
		name: 'receiptType'
	});

	// 對話框狀態
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

	// 計算總金額
	const totalAmount = useMemo(() => {
		if (!receiptItems || receiptItems.length === 0) return 0;

		return receiptItems.reduce((sum, item) => {
			return sum + (Number(item.receiptAmount) || 0);
		}, 0);
	}, [receiptItems]);

	// 開啟新增對話框
	const handleAddReceiptItem = () => {
		setEditingItemIndex(null);
		setDialogOpen(true);
	};

	// 開啟編輯對話框
	const handleEditReceiptItem = (index: number) => {
		setEditingItemIndex(index);
		setDialogOpen(true);
	};

	// 儲存收據項目
	const handleSaveReceiptItem = (item: any) => {
		if (editingItemIndex !== null) {
			// 更新現有項目
			update(editingItemIndex, item);
		} else {
			// 新增項目
			append(item);
		}
	};

	// 訂單選項格式化
	const orderOptions = orders.map((order) => ({
		id: order.orderNumber,
		label: `${order.orderNumber} - ${order.groupName} - ${order.contactPerson}`
	}));

	return (
		<div className="space-y-8">
			{/* 共同設定區域 */}
			<Paper className="p-4">
				<Typography
					variant="h6"
					className="mb-4"
				>
					共同設定
				</Typography>
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
									field.value
										? orderOptions.find((option) => option.id === field.value) || null
										: null
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
										error: !!errors.receiptDate,
										helperText: errors?.receiptDate?.message as string,
										required: true,
										fullWidth: true
									}
								}}
							/>
						)}
					/>

					<Controller
						name="receiptType"
						control={control}
						defaultValue=""
						render={({ field }) => (
							<FormControl
								fullWidth
								error={!!errors.receiptType}
							>
								<InputLabel>收款方式</InputLabel>
								<Select
									{...field}
									label="收款方式"
									required
									value={field.value || ''}
								>
									{RECEIPT_TYPE_OPTIONS.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value.toString()}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
								{errors.receiptType && (
									<FormHelperText>{errors.receiptType.message as string}</FormHelperText>
								)}
							</FormControl>
						)}
					/>
				</div>
			</Paper>

			<Divider />

			{/* 收據項目區域 */}
			<div>
				<div className="flex justify-between items-center mb-4">
					<Typography variant="h6">收據項目</Typography>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={handleAddReceiptItem}
					>
						新增項目
					</Button>
				</div>

				<TableContainer component={Paper}>
					<Table>
						<TableHead>
							<TableRow>
								<TableCell>收款帳號</TableCell>
								<TableCell align="right">金額</TableCell>
								<TableCell>備註</TableCell>
								<TableCell align="right">操作</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{typedFields.map((field, index) => (
								<TableRow key={field.id}>
									<TableCell>{field.receiptAccount}</TableCell>
									<TableCell align="right">{field.receiptAmount?.toLocaleString()}</TableCell>
									<TableCell>{field.note}</TableCell>
									<TableCell align="right">
										<IconButton
											size="small"
											color="primary"
											onClick={() => handleEditReceiptItem(index)}
										>
											<EditIcon />
										</IconButton>
										<IconButton
											size="small"
											color="error"
											onClick={() => remove(index)}
											disabled={fields.length <= 1}
										>
											<DeleteIcon />
										</IconButton>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>

			{/* 總金額顯示 */}
			<Box
				display="flex"
				justifyContent="flex-end"
				mt={2}
			>
				<Typography variant="h6">總金額: {totalAmount.toLocaleString()}</Typography>
			</Box>

			{/* 收據項目對話框 */}
			<ReceiptItemDialog
				open={dialogOpen}
				onClose={() => setDialogOpen(false)}
				onSave={handleSaveReceiptItem}
				editingItem={editingItemIndex !== null ? typedFields[editingItemIndex] : null}
				receiptType={Number(receiptType)}
			/>
		</div>
	);
}

export default BasicInfoTab;
