'use client';

import React, { useEffect, useState } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	FormControl,
	InputLabel,
	Select,
	MenuItem,
	FormHelperText,
	Stack,
	Box,
	Autocomplete
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { InvoiceItem } from '@/app/(control-panel)/invoices/InvoiceApi';
import { INVOICE_ITEM_TYPE_OPTIONS } from 'src/constants/invoiceItemTypes';
import { useAuth } from '@/contexts/AuthContext';
import { useGetSuppliersQuery } from 'src/app/(control-panel)/suppliers/SupplierApi';
import { getSupplierTypesByInvoiceItemType } from 'src/constants/supplierTypes';
import { useDialogClose } from 'src/hooks/useDialogClose';
import { generateId } from '@/utils/tools';

// 表單驗證規則
const schema = yup
	.object({
		invoiceType: yup.number().required('請選擇請款項目類型'),
		payFor: yup.string().required('請選擇供應商'),
		price: yup.number().required('請輸入金額').min(0, '金額必須大於或等於0'),
		quantity: yup.number().required('請輸入數量'),
		note: yup.string()
	})
	.required();

type InvoiceItemFormData = yup.InferType<typeof schema>;

interface InvoiceItemDialogProps {
	open: boolean;
	onClose: () => void;
	onSave: (item: InvoiceItem) => void;
	editingItem: InvoiceItem | null;
	invoiceNumber: string;
	suppliers: any[];
}

const InvoiceItemDialog: React.FC<InvoiceItemDialogProps> = ({
	open,
	onClose,
	onSave,
	editingItem,
	invoiceNumber,
	suppliers
}) => {
	const { session, user } = useAuth();
	const { data: suppliersData = [] } = useGetSuppliersQuery();
	const [filteredSuppliers, setFilteredSuppliers] = useState<any[]>([]);

	const {
		control,
		handleSubmit,
		reset,
		watch,
		formState: { errors }
	} = useForm<InvoiceItemFormData>({
		resolver: yupResolver(schema),
		defaultValues: {
			invoiceType: editingItem?.invoiceType || undefined,
			payFor: editingItem?.payFor || '',
			price: editingItem?.price || 0,
			quantity: editingItem?.quantity || 1,
			note: editingItem?.note || ''
		}
	});

	// 監聽請款項目類型變化
	const invoiceType = watch('invoiceType');

	// 當請款項目類型變化時，過濾供應商列表
	useEffect(() => {
		if (!suppliersData.length) return;

		const allowedTypes = getSupplierTypesByInvoiceItemType(invoiceType);

		if (allowedTypes.length > 0) {
			const filtered = suppliersData.filter((supplier) => allowedTypes.includes(supplier.supplierType as any));
			setFilteredSuppliers(filtered);
		} else {
			setFilteredSuppliers(suppliersData);
		}
	}, [invoiceType, suppliersData]);

	// 當編輯項目變化時，重置表單並設置初始供應商列表
	useEffect(() => {
		if (open) {
			// 重置表單
			reset({
				invoiceType: editingItem?.invoiceType !== undefined ? editingItem.invoiceType : undefined,
				payFor: editingItem?.payFor || '',
				price: editingItem?.price || 0,
				quantity: editingItem?.quantity || 1,
				note: editingItem?.note || ''
			});

			// 修改判斷條件，使用 !== undefined 來檢查 invoiceType 是否存在
			// 這樣即使 invoiceType 為 0 也能正確處理
			if (editingItem?.invoiceType !== undefined && suppliersData.length) {
				const allowedTypes = getSupplierTypesByInvoiceItemType(editingItem.invoiceType);

				if (allowedTypes.length > 0) {
					const filtered = suppliersData.filter((supplier) =>
						allowedTypes.includes(supplier.supplierType as any)
					);
					setFilteredSuppliers(filtered);
				} else {
					setFilteredSuppliers(suppliersData);
				}
			}
		}
	}, [open, editingItem, reset, suppliersData]);

	// 使用自定義 Hook 處理對話框關閉
	const handleClose = useDialogClose(onClose);

	const onSubmit = (data: InvoiceItemFormData) => {
		const now = new Date();

		if (editingItem) {
			// 更新現有項目
			onSave({
				...editingItem,
				...data,
				modifiedAt: now,
				modifiedBy: user?.id || ''
			});
		} else {
			// 新增項目
			onSave({
				id: generateId(),
				invoiceNumber,
				...data,
				createdAt: now,
				createdBy: user?.id || '',
				modifiedAt: now,
				modifiedBy: user?.id || ''
			});
		}

		handleClose();
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>{editingItem ? '編輯請款項目' : '新增請款項目'}</DialogTitle>
			<DialogContent>
				<form
					id="invoice-item-form"
					onSubmit={handleSubmit(onSubmit)}
				>
					<Stack
						spacing={2}
						sx={{ mt: 2 }}
					>
						<Stack
							direction={{ xs: 'column', md: 'row' }}
							spacing={2}
						>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="invoiceType"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.invoiceType}
										>
											<InputLabel>請款項目類型</InputLabel>
											<Select
												{...field}
												label="請款項目類型"
											>
												{INVOICE_ITEM_TYPE_OPTIONS.map((option) => (
													<MenuItem
														key={option.value}
														value={option.value}
													>
														{option.label}
													</MenuItem>
												))}
											</Select>
											{errors.invoiceType && (
												<FormHelperText>{errors.invoiceType.message}</FormHelperText>
											)}
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="payFor"
									control={control}
									render={({ field: { onChange, value, ...field } }) => (
										<FormControl
											fullWidth
											error={!!errors.payFor}
										>
											<Autocomplete
												options={filteredSuppliers}
												getOptionLabel={(option) =>
													typeof option === 'string' ? option : `${option.supplierName}`
												}
												value={
													value
														? filteredSuppliers.find(
																(supplier) => supplier.supplierCode === value
															) || null
														: null
												}
												onChange={(_, newValue) => {
													onChange(newValue ? newValue.supplierCode : '');
												}}
												renderInput={(params) => (
													<TextField
														{...params}
														{...field}
														label="供應商"
														error={!!errors.payFor}
														helperText={errors.payFor?.message}
													/>
												)}
												isOptionEqualToValue={(option, value) =>
													option.supplierCode === value.supplierCode
												}
												filterOptions={(options, state) => {
													const inputValue = state.inputValue.toLowerCase();
													return options.filter((option) =>
														option.supplierName.toLowerCase().includes(inputValue)
													);
												}}
											/>
										</FormControl>
									)}
								/>
							</Box>
						</Stack>
						<Stack
							direction={{ xs: 'column', md: 'row' }}
							spacing={2}
						>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="price"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="金額"
											type="number"
											fullWidth
											error={!!errors.price}
											helperText={errors.price?.message}
											InputProps={{
												inputProps: { min: 0 }
											}}
										/>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="quantity"
									control={control}
									render={({ field }) => (
										<TextField
											{...field}
											label="數量"
											type="number"
											fullWidth
											error={!!errors.quantity}
											helperText={errors.quantity?.message}
										/>
									)}
								/>
							</Box>
						</Stack>
						<Box>
							<Controller
								name="note"
								control={control}
								render={({ field }) => (
									<TextField
										{...field}
										label="備註"
										fullWidth
										multiline
										rows={3}
										error={!!errors.note}
										helperText={errors.note?.message}
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
					form="invoice-item-form"
					variant="contained"
					color="primary"
				>
					儲存
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default InvoiceItemDialog;
