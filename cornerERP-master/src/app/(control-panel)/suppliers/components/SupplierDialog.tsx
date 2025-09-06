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
	Stack,
	Box,
	Switch,
	FormControlLabel,
	MenuItem
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/contexts/AuthContext';
import { Supplier, useCreateSupplierMutation } from '../SupplierApi';
import { SUPPLIER_TYPES } from 'src/constants/supplierTypes';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useDialogClose } from 'src/hooks/useDialogClose';
import LoadingButton from '@/components/common/LoadingButton';
import { SupplierFormData, supplierSchema } from '../schemas/supplierSchema';

// 表單驗證規則

interface SupplierDialogProps {
	open: boolean;
	onClose: () => void;
	onSave?: (supplier: Supplier) => void;
}

const SupplierDialog: React.FC<SupplierDialogProps> = ({ open, onClose, onSave }) => {
	const { session, user } = useAuth();
	const [createSupplier] = useCreateSupplierMutation();
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isValid }
	} = useForm<SupplierFormData>({
		resolver: yupResolver(supplierSchema),
		defaultValues: {
			supplierName: '',
			supplierType: '',
			accountCode: '',
			accountName: '',
			bankCode: '',
			isQuoted: false
		}
	});

	// 當對話框打開時，重置表單
	useEffect(() => {
		if (open) {
			reset();
		}
	}, [open, reset]);

	// 使用自定義 Hook 處理對話框關閉
	const handleClose = useDialogClose(onClose);

	const handleSaveSupplier = async (data: SupplierFormData) => {
		if (!user?.id) return;

		setIsLoading(true);

		try {
			// 根據供應商類型生成供應商編號
			// 例如：B2B0002，數字至少四碼
			const maxNumber = await maxNumberGetDbNumber(data.supplierType, 4);

			const newSupplier = {
				supplierCode: maxNumber,
				supplierName: data.supplierName,
				supplierType: data.supplierType,
				accountCode: data.accountCode || '',
				accountName: data.accountName || '',
				bankCode: data.bankCode || '',
				isQuoted: data.isQuoted,
				createdAt: new Date(),
				createdBy: user.id,
				modifiedAt: new Date(),
				modifiedBy: user.id
			} as Supplier;

			const result = await createSupplier(newSupplier).unwrap();

			if (onSave) {
				onSave(result);
			}

			onClose();
		} catch (error) {
			console.error('Failed to create supplier:', error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>新增供應商</DialogTitle>
			<form onSubmit={handleSubmit(handleSaveSupplier)}>
				<DialogContent>
					<Stack
						spacing={3}
						sx={{ mt: 1 }}
					>
						<Box sx={{ flex: 1 }}>
							<Controller
								name="supplierName"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.supplierName}
									>
										<TextField
											{...field}
											label="供應商名稱"
											error={!!errors.supplierName}
											helperText={errors.supplierName?.message}
										/>
									</FormControl>
								)}
							/>
						</Box>

						<Stack
							direction="row"
							spacing={2}
						>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="supplierType"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.supplierType}
										>
											<TextField
												{...field}
												select
												label="供應商類別"
												error={!!errors.supplierType}
												helperText={errors.supplierType?.message}
											>
												{Object.entries(SUPPLIER_TYPES).map(([key, value]) => (
													<MenuItem
														key={key}
														value={value}
													>
														{key === 'HOTEL' && '飯店'}
														{key === 'TRAFFIC' && '交通'}
														{key === 'FOOD' && '餐飲'}
														{key === 'ACTIVITY' && '活動'}
														{key === 'OTHER' && '其他'}
														{key === 'EMPLOYEE' && '員工'}
														{key === 'B2B' && '同業'}
													</MenuItem>
												))}
											</TextField>
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="accountName"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.accountName}
										>
											<TextField
												{...field}
												label="帳戶名稱"
												error={!!errors.accountName}
												helperText={errors.accountName?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
						</Stack>

						<Stack
							direction="row"
							spacing={2}
						>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="bankCode"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.bankCode}
										>
											<TextField
												{...field}
												label="銀行代碼"
												error={!!errors.bankCode}
												helperText={errors.bankCode?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="accountCode"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.accountCode}
										>
											<TextField
												{...field}
												label="銀行號碼"
												error={!!errors.accountCode}
												helperText={errors.accountCode?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
						</Stack>

						<Box>
							<Controller
								name="isQuoted"
								control={control}
								render={({ field: { value, onChange, ...field } }) => (
									<FormControlLabel
										control={
											<Switch
												checked={value}
												onChange={(e) => onChange(e.target.checked)}
												{...field}
											/>
										}
										label="有無B2B報價"
									/>
								)}
							/>
						</Box>
					</Stack>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						disabled={isLoading}
					>
						取消
					</Button>
					<LoadingButton
						type="submit"
						variant="contained"
						color="primary"
						disabled={!isValid || isLoading}
						isLoading={isLoading}
					>
						儲存
					</LoadingButton>
				</DialogActions>
			</form>
		</Dialog>
	);
};

export default SupplierDialog;
