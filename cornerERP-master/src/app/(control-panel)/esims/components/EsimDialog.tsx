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
	MenuItem
} from '@mui/material';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useAuth } from '@/contexts/AuthContext';
import { Esim, useCreateEsimMutation } from '../EsimApi';
import { useDialogClose } from 'src/hooks/useDialogClose';
import LoadingButton from '@/components/common/LoadingButton';
import { EsimFormData, esimSchema } from '../schemas/esimSchema';

interface EsimDialogProps {
	open: boolean;
	onClose: () => void;
	onSave?: (esim: Esim) => void;
}

// 狀態選項
const STATUS_OPTIONS = [
	{ value: 0, label: '待確認' },
	{ value: 1, label: '已確認' },
	{ value: 2, label: '錯誤' }
];

const EsimDialog: React.FC<EsimDialogProps> = ({ open, onClose, onSave }) => {
	const { session, user } = useAuth();
	const [createEsim] = useCreateEsimMutation();
	const [isLoading, setIsLoading] = useState(false);

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors, isValid }
	} = useForm<EsimFormData>({
		resolver: yupResolver(esimSchema),
		defaultValues: {
			esimNumber: '',
			groupCode: '',
			orderNumber: '',
			supplierOrderNumber: '',
			status: 0,
			productId: '',
			quantity: 1,
			email: ''
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

	const handleSaveEsim = async (data: EsimFormData) => {
		if (!user?.id) return;

		setIsLoading(true);

		try {
			const newEsim = {
				esimNumber: data.esimNumber,
				groupCode: data.groupCode,
				orderNumber: data.orderNumber || '',
				supplierOrderNumber: data.supplierOrderNumber || '',
				status: data.status,
				productId: data.productId,
				quantity: data.quantity,
				email: data.email,
				createdAt: new Date(),
				createdBy: user.id,
				modifiedAt: new Date(),
				modifiedBy: user.id
			} as Esim;

			const result = await createEsim(newEsim).unwrap();

			if (onSave) {
				onSave(result);
			}

			onClose();
		} catch (error) {
			console.error('Failed to create esim:', error);
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
			<DialogTitle>新增網卡</DialogTitle>
			<form onSubmit={handleSubmit(handleSaveEsim)}>
				<DialogContent>
					<Stack
						spacing={3}
						sx={{ mt: 1 }}
					>
						<Stack
							direction="row"
							spacing={2}
						>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="esimNumber"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.esimNumber}
										>
											<TextField
												{...field}
												label="網卡單號"
												error={!!errors.esimNumber}
												helperText={errors.esimNumber?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="groupCode"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.groupCode}
										>
											<TextField
												{...field}
												label="團號"
												error={!!errors.groupCode}
												helperText={errors.groupCode?.message}
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
									name="orderNumber"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.orderNumber}
										>
											<TextField
												{...field}
												label="訂單編號"
												error={!!errors.orderNumber}
												helperText={errors.orderNumber?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="supplierOrderNumber"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.supplierOrderNumber}
										>
											<TextField
												{...field}
												label="供應商訂單編號"
												error={!!errors.supplierOrderNumber}
												helperText={errors.supplierOrderNumber?.message}
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
									name="productId"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.productId}
										>
											<TextField
												{...field}
												label="商品Id"
												error={!!errors.productId}
												helperText={errors.productId?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
							<Box sx={{ flex: 1 }}>
								<Controller
									name="quantity"
									control={control}
									render={({ field }) => (
										<FormControl
											fullWidth
											error={!!errors.quantity}
										>
											<TextField
												{...field}
												type="number"
												label="數量"
												inputProps={{ min: 1, max: 9 }}
												error={!!errors.quantity}
												helperText={errors.quantity?.message}
											/>
										</FormControl>
									)}
								/>
							</Box>
						</Stack>

						<Box sx={{ flex: 1 }}>
							<Controller
								name="email"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.email}
									>
										<TextField
											{...field}
											type="email"
											label="信箱"
											error={!!errors.email}
											helperText={errors.email?.message}
										/>
									</FormControl>
								)}
							/>
						</Box>

						<Box sx={{ flex: 1 }}>
							<Controller
								name="status"
								control={control}
								render={({ field }) => (
									<FormControl
										fullWidth
										error={!!errors.status}
									>
										<TextField
											{...field}
											select
											label="狀態"
											error={!!errors.status}
											helperText={errors.status?.message}
										>
											{STATUS_OPTIONS.map((option) => (
												<MenuItem
													key={option.value}
													value={option.value}
												>
													{option.label}
												</MenuItem>
											))}
										</TextField>
									</FormControl>
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

export default EsimDialog;
