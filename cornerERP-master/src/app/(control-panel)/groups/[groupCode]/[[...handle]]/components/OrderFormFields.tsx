import { Controller, useFormContext } from 'react-hook-form';
import { TextField, Autocomplete, Typography, Box } from '@mui/material';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';

interface OrderFormFieldsProps {
	mode: 'create' | 'edit';
	groupCode: string;
	orderIndex?: number; // 用於多訂單場景的索引
	prefix?: string; // 欄位名稱前綴，例如 'orders.0.'
}

/**
 * 可重用的訂單表單欄位組件
 * 可以在不同場景下使用，避免程式碼重複
 */
function OrderFormFields({ mode, groupCode, orderIndex = 0, prefix = '' }: OrderFormFieldsProps) {
	const { control, formState } = useFormContext();
	const { errors } = formState;
	const { users } = useUserDictionary();

	// 構建欄位名稱
	const getFieldName = (fieldName: string) => `${prefix}${fieldName}`;

	// 獲取欄位錯誤
	const getFieldError = (fieldName: string) => {
		const fullFieldName = getFieldName(fieldName);
		const pathArray = fullFieldName.split('.');
		let error = errors;
		for (const path of pathArray) {
			error = error?.[path];
		}
		return error;
	};

	// 用戶選項
	const userOptions = users.map((user) => ({
		id: user.id,
		label: user.displayName
	}));

	return (
		<Box>
			{/* 如果有多個訂單，顯示訂單標題 */}
			{orderIndex > 0 && (
				<Typography
					variant="h6"
					sx={{ mb: 2 }}
				>
					訂單 {orderIndex + 1}
				</Typography>
			)}

			<Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* 訂單編號 - 編輯模式才顯示 */}
				{mode === 'edit' && (
					<Controller
						name={getFieldName('orderNumber')}
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="訂單編號"
								variant="outlined"
								fullWidth
								disabled
								InputProps={{ readOnly: true }}
							/>
						)}
					/>
				)}

				{/* 聯絡人 */}
				<Controller
					name={getFieldName('contactPerson')}
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="聯絡人"
							variant="outlined"
							fullWidth
							required
							error={!!getFieldError('contactPerson')}
							helperText={getFieldError('contactPerson')?.message as string}
						/>
					)}
				/>

				{/* 聯絡電話 */}
				<Controller
					name={getFieldName('contactPhone')}
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="聯絡電話"
							variant="outlined"
							fullWidth
							required
							error={!!getFieldError('contactPhone')}
							helperText={getFieldError('contactPhone')?.message as string}
						/>
					)}
				/>

				{/* 業務員 */}
				<Controller
					name={getFieldName('salesPerson')}
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
									required
									error={!!getFieldError('salesPerson')}
									helperText={getFieldError('salesPerson')?.message as string}
								/>
							)}
						/>
					)}
				/>

				{/* OP員 */}
				<Controller
					name={getFieldName('opId')}
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
									error={!!getFieldError('opId')}
									helperText={getFieldError('opId')?.message as string}
								/>
							)}
						/>
					)}
				/>
			</Box>
		</Box>
	);
}

export default OrderFormFields;
