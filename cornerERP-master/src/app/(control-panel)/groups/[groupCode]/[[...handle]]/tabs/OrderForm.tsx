import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TextField, Button, Stack, Box, Autocomplete } from '@mui/material';
import { useAuth } from '@/contexts/AuthContext';
import { Order, useCreateOrderMutation, useUpdateOrderMutation } from '@/app/(control-panel)/orders/OrderApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useGetUsersWithOutSessionQuery } from '@/app/(control-panel)/users/UserApi';

// Form validation schema
const schema = z.object({
	orderNumber: z.string().optional(), // Auto-generated for new orders
	contactPerson: z.string().min(1, '聯絡人不能為空'),
	contactPhone: z.string().min(1, '聯絡電話不能為空'),
	salesPerson: z.string().min(1, '業務不能為空'),
	opId: z.string().min(1, 'OP不能為空')
	// Add other fields as needed
});

type OrderFormProps = {
	order: Order | null;
	groupCode: string;
	onClose: () => void;
};

function OrderForm({ order, groupCode, onClose }: OrderFormProps) {
	const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();
	const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
	const { session, user } = useAuth();
	const { data: users = [] } = useGetUsersWithOutSessionQuery();

	const isLoading = isCreating || isUpdating;
	const isNewOrder = !order;

	const {
		control,
		handleSubmit,
		reset,
		formState: { errors }
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: {
			orderNumber: '',
			contactPerson: '',
			contactPhone: '',
			salesPerson: '',
			opId: ''
			// Initialize other fields
		}
	});

	useEffect(() => {
		if (order) {
			reset({
				orderNumber: order.orderNumber,
				contactPerson: order.contactPerson,
				contactPhone: order.contactPhone,
				salesPerson: order.salesPerson,
				opId: order.opId
				// Set other fields
			});
		} else {
			reset({
				orderNumber: '',
				contactPerson: '',
				contactPhone: '',
				salesPerson: '',
				opId: ''
				// Reset other fields
			});
		}
	}, [order, reset]);

	const onSubmit = async (data) => {
		try {
			if (isNewOrder) {
				const newOrderNumber = await maxNumberGetDbNumber(groupCode, 2);

				await createOrder({
					...data,
					orderNumber: newOrderNumber,
					groupCode,
					createdBy: user?.id || '',
					createdAt: new Date(),
					modifiedBy: user?.id || '',
					modifiedAt: new Date()
				}).unwrap();
			} else {
				await updateOrder({
					...data,
					orderNumber: order.orderNumber,
					groupCode,
					modifiedBy: user?.id || '',
					modifiedAt: new Date()
				}).unwrap();
			}

			onClose();
		} catch (error) {
			console.error('Failed to save order:', error);
		}
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<Stack spacing={3}>
				{!isNewOrder && (
					<Controller
						name="orderNumber"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="訂單編號"
								fullWidth
								disabled
							/>
						)}
					/>
				)}

				<Controller
					name="contactPerson"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="聯絡人"
							fullWidth
							error={!!errors.contactPerson}
							helperText={errors.contactPerson?.message}
							required
						/>
					)}
				/>

				<Controller
					name="contactPhone"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="聯絡電話"
							fullWidth
							error={!!errors.contactPhone}
							helperText={errors.contactPhone?.message}
							required
						/>
					)}
				/>

				{/* <Controller
					name="orderType"
					control={control}
					render={({ field }) => (
						<FormControl
							fullWidth
							error={!!errors.orderType}
						>
							<InputLabel>訂單類型</InputLabel>
							<Select
								{...field}
								label="訂單類型"
								required
							>
								<MenuItem value="B2C">B2C</MenuItem>
								<MenuItem value="B2B">B2B</MenuItem>
								<MenuItem value="BBC">B2B</MenuItem>
							</Select>
							{errors.orderType && <FormHelperText>{errors.orderType.message}</FormHelperText>}
						</FormControl>
					)}
				/> */}

				<Controller
					name="salesPerson"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							options={users}
							getOptionLabel={(option) => {
								if (typeof option === 'string') {
									return option;
								}

								return option?.displayName || '';
							}}
							value={
								field.value && users.length > 0
									? users.find((user) => user.id === field.value) || null
									: null
							}
							onChange={(_, newValue) => {
								field.onChange(newValue ? newValue.id : null);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="業務"
									variant="outlined"
									fullWidth
									error={!!errors.salesPerson}
									helperText={errors?.salesPerson?.message as string}
									required
								/>
							)}
							loading={users.length === 0}
							loadingText="載入中..."
						/>
					)}
				/>

				<Controller
					name="opId"
					control={control}
					render={({ field }) => (
						<Autocomplete
							{...field}
							options={users}
							getOptionLabel={(option) => {
								if (typeof option === 'string') {
									return option;
								}

								return option?.displayName || '';
							}}
							value={
								field.value && users.length > 0
									? users.find((user) => user.id === field.value) || null
									: null
							}
							onChange={(_, newValue) => {
								field.onChange(newValue ? newValue.id : null);
							}}
							renderInput={(params) => (
								<TextField
									{...params}
									label="OP"
									variant="outlined"
									fullWidth
									error={!!errors.opId}
									helperText={errors?.opId?.message as string}
									required
								/>
							)}
							loading={users.length === 0}
							loadingText="載入中..."
						/>
					)}
				/>
				<Box className="flex justify-end gap-3">
					<Button
						variant="outlined"
						onClick={onClose}
						disabled={isLoading}
					>
						取消
					</Button>
					<Button
						type="submit"
						variant="contained"
						color="primary"
						disabled={isLoading}
					>
						{isNewOrder ? '新增' : '儲存'}
					</Button>
				</Box>
			</Stack>
		</form>
	);
}

export default OrderForm;
