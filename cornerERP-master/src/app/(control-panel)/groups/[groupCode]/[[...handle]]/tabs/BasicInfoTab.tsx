import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography, Divider, Box } from '@mui/material';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { GROUP_STATUS_OPTIONS } from '@/constants/groupStatuses';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import OrderFormFields from '../components/OrderFormFields';

/**
 * The basic info tab.
 */
function BasicInfoTab({ showAllOptions }: { showAllOptions: boolean }) {
	const methods = useFormContext();
	const { control, formState, watch } = methods;
	const { errors } = formState;
	const { users } = useUserDictionary();
	const departureDate = watch('departureDate');
	const [minReturnDate, setMinReturnDate] = useState<Date | null>(null);
	const returnDate = watch('returnDate');
	const routeParams = useParams<{ groupCode: string }>();
	const { groupCode } = routeParams;

	// 判斷是否為新增模式
	const isNewGroup = groupCode === 'new';

	useEffect(() => {
		if (departureDate) {
			setMinReturnDate(new Date(departureDate));

			if (returnDate && new Date(returnDate) < new Date(departureDate)) {
				methods.setValue('returnDate', departureDate);
			}
		} else {
			setMinReturnDate(null);
		}
	}, [departureDate, returnDate]);

	// 將 dictionary 轉換為選項陣列
	const opOptions = users.map((user) => ({
		id: user.id,
		label: `${user.displayName}`
	}));

	return (
		<Box>
			{/* 基本資料區塊 */}
			<Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Controller
					name="groupName"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							required
							label="團名"
							variant="outlined"
							fullWidth
							error={!!errors.groupName}
							helperText={errors?.groupName?.message as string}
						/>
					)}
				/>

				<Controller
					name="groupCode"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="團號"
							autoFocus
							variant="outlined"
							fullWidth
							disabled
						/>
					)}
				/>

				<Controller
					name="departureDate"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="出發日期"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : ''}
							slotProps={{
								textField: {
									fullWidth: true,
									required: true,
									error: !!errors.departureDate,
									helperText: errors?.departureDate?.message as string
								}
							}}
						/>
					)}
				/>

				<Controller
					name="returnDate"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="回程日期"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : ''}
							slotProps={{
								textField: {
									fullWidth: true,
									required: true,
									error: !!errors.returnDate,
									helperText: errors?.returnDate?.message as string
								}
							}}
							minDate={minReturnDate}
						/>
					)}
				/>
				{showAllOptions && (
					<Controller
						name="status"
						control={control}
						render={({ field }) => (
							<FormControl
								fullWidth
								error={!!errors.status}
							>
								<InputLabel>狀態</InputLabel>
								<Select
									{...field}
									label="狀態"
									required
								>
									{GROUP_STATUS_OPTIONS.map((option) => (
										<MenuItem
											key={option.value}
											value={option.value}
										>
											{option.label}
										</MenuItem>
									))}
								</Select>
								{errors.status && <FormHelperText>{errors.status.message as string}</FormHelperText>}
							</FormControl>
						)}
					/>
				)}
			</Box>

			{/* 新增模式時顯示訂單表單 */}
			{isNewGroup && (
				<Box sx={{ mt: 4 }}>
					<Divider sx={{ mb: 3 }} />
					<Typography
						variant="h6"
						sx={{ mb: 3 }}
					>
						訂單資訊
					</Typography>
					<OrderFormFields
						mode="create"
						groupCode={groupCode}
						prefix="order."
					/>
				</Box>
			)}
		</Box>
	);
}

export default BasicInfoTab;
