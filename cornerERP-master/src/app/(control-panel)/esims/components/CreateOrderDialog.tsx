import { useState, useEffect } from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	TextField,
	Autocomplete,
	Box,
	IconButton,
	CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useCreateOrderMutation } from '@/app/(control-panel)/orders/OrderApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useGetGroupsQuery } from '@/app/(control-panel)/groups/GroupApi';

// 訂單創建的 schema
const createOrderSchema = z.object({
	groupCode: z.string().min(1, '團號不能為空'),
	contactPerson: z.string().min(1, '聯絡人不能為空'),
	contactPhone: z.string().min(1, '聯絡電話不能為空'),
	salesPerson: z.string().min(1, '業務員不能為空'),
	opId: z.string().optional()
});

type CreateOrderFormData = z.infer<typeof createOrderSchema>;

interface CreateOrderDialogProps {
	open: boolean;
	onClose: () => void;
	selectedGroupCode?: string;
	onOrderCreated: (orderNumber: string) => void;
}

function CreateOrderDialog({ open, onClose, selectedGroupCode, onOrderCreated }: CreateOrderDialogProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { users } = useUserDictionary();
	const { data: groups = [] } = useGetGroupsQuery();
	const [createOrder] = useCreateOrderMutation();

	const {
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors }
	} = useForm<CreateOrderFormData>({
		resolver: zodResolver(createOrderSchema),
		defaultValues: {
			groupCode: '',
			contactPerson: '',
			contactPhone: '',
			salesPerson: '',
			opId: ''
		}
	});

	// 當 selectedGroupCode 改變時，更新表單中的團號
	useEffect(() => {
		if (selectedGroupCode) {
			setValue('groupCode', selectedGroupCode);
		}
	}, [selectedGroupCode, setValue]);

	// 處理關閉對話框
	const handleClose = () => {
		reset();
		onClose();
	};

	// 提交表單
	const onSubmit = async (data: CreateOrderFormData) => {
		try {
			setIsSubmitting(true);

			// 生成訂單編號
			const orderNumber = await maxNumberGetDbNumber(data.groupCode, 2);

			// 創建訂單資料
			const orderData = {
				orderNumber,
				groupCode: data.groupCode,
				contactPerson: data.contactPerson,
				contactPhone: data.contactPhone,
				salesPerson: data.salesPerson,
				opId: data.opId || null
			};

			// 調用 API 創建訂單
			const result = await createOrder(orderData).unwrap();

			// 通知父組件訂單已創建
			onOrderCreated(orderNumber);

			// 關閉對話框
			handleClose();
		} catch (error) {
			console.error('創建訂單失敗:', error);
			// 這裡可以添加錯誤提示
		} finally {
			setIsSubmitting(false);
		}
	};

	// 用戶選項
	const userOptions = users.map((user) => ({
		id: user.id,
		label: user.displayName
	}));

	// 團號選項
	const groupOptions = groups.map((group) => ({
		id: group.groupCode,
		label: `${group.groupCode} - ${group.groupName}`
	}));

	return (
		<Dialog
			open={open}
			onClose={handleClose}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle sx={{ pr: 1 }}>
				新增訂單
				<IconButton
					aria-label="close"
					onClick={handleClose}
					sx={{
						position: 'absolute',
						right: 8,
						top: 8,
						color: (theme) => theme.palette.grey[500]
					}}
				>
					<CloseIcon />
				</IconButton>
			</DialogTitle>

			<form onSubmit={handleSubmit(onSubmit)}>
				<DialogContent>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
						{/* 團號 */}
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
										field.onChange(newValue ? newValue.id : '');
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="團號"
											variant="outlined"
											fullWidth
											error={!!errors.groupCode}
											helperText={errors.groupCode?.message}
											required
										/>
									)}
									disabled={!!selectedGroupCode}
								/>
							)}
						/>

						{/* 聯絡人 */}
						<Controller
							name="contactPerson"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="聯絡人"
									variant="outlined"
									fullWidth
									error={!!errors.contactPerson}
									helperText={errors.contactPerson?.message}
									required
								/>
							)}
						/>

						{/* 聯絡電話 */}
						<Controller
							name="contactPhone"
							control={control}
							render={({ field }) => (
								<TextField
									{...field}
									label="聯絡電話"
									variant="outlined"
									fullWidth
									error={!!errors.contactPhone}
									helperText={errors.contactPhone?.message}
									required
								/>
							)}
						/>

						{/* 業務員 */}
						<Controller
							name="salesPerson"
							control={control}
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={userOptions}
									getOptionLabel={(option) => {
										if (typeof option === 'string') {
											return option;
										}

										return option?.label || '';
									}}
									value={
										field.value && userOptions.length > 0
											? userOptions.find((option) => option.id === field.value) || null
											: null
									}
									onChange={(_, newValue) => {
										field.onChange(newValue ? newValue.id : '');
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="業務員"
											variant="outlined"
											fullWidth
											error={!!errors.salesPerson}
											helperText={errors.salesPerson?.message}
											required
										/>
									)}
								/>
							)}
						/>

						{/* OP員 */}
						<Controller
							name="opId"
							control={control}
							render={({ field }) => (
								<Autocomplete
									{...field}
									options={userOptions}
									getOptionLabel={(option) => {
										if (typeof option === 'string') {
											return option;
										}

										return option?.label || '';
									}}
									value={
										field.value && userOptions.length > 0
											? userOptions.find((option) => option.id === field.value) || null
											: null
									}
									onChange={(_, newValue) => {
										field.onChange(newValue ? newValue.id : '');
									}}
									renderInput={(params) => (
										<TextField
											{...params}
											label="OP員"
											variant="outlined"
											fullWidth
											error={!!errors.opId}
											helperText={errors.opId?.message}
										/>
									)}
								/>
							)}
						/>
					</Box>
				</DialogContent>

				<DialogActions sx={{ px: 3, pb: 3 }}>
					<Button
						onClick={handleClose}
						disabled={isSubmitting}
					>
						取消
					</Button>
					<Button
						type="submit"
						variant="contained"
						disabled={isSubmitting}
					>
						{isSubmitting ? <CircularProgress size={20} /> : '新增'}
					</Button>
				</DialogActions>
			</form>
		</Dialog>
	);
}

export default CreateOrderDialog;
