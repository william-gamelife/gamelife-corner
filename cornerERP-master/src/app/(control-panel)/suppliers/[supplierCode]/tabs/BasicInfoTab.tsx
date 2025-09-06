import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { FormControlLabel, Checkbox } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem, FormHelperText } from '@mui/material';
import { SUPPLIER_TYPE_OPTIONS } from '@/constants/supplierTypes';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;

	// 在表單中添加狀態顯示
	return (
		<div className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<Controller
					name="supplierName"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="供應商名稱"
							variant="outlined"
							fullWidth
							required
							error={!!errors.supplierName}
							helperText={errors?.supplierName?.message as string}
						/>
					)}
				/>
				<Controller
					name="supplierCode"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="供應商編號"
							autoFocus
							variant="outlined"
							fullWidth
							disabled={true}
							error={!!errors.supplierCode}
							helperText={errors?.supplierCode?.message as string}
						/>
					)}
				/>
				<Controller
					name="supplierType"
					control={control}
					render={({ field }) => (
						<FormControl
							fullWidth
							error={!!errors.supplierType}
						>
							<InputLabel>供應商類別</InputLabel>
							<Select
								{...field}
								value={field.value || ''}
								label="供應商類別"
								required
							>
								<MenuItem value="">請選擇供應商類別</MenuItem>
								{SUPPLIER_TYPE_OPTIONS.map((option) => (
									<MenuItem
										key={option.value}
										value={option.value}
									>
										{option.label}
									</MenuItem>
								))}
							</Select>
							{errors.supplierType && (
								<FormHelperText error>{String(errors.supplierType.message)}</FormHelperText>
							)}
						</FormControl>
					)}
				/>
				<Controller
					name="accountName"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="帳戶名稱"
							variant="outlined"
							fullWidth
							error={!!errors.accountName}
							helperText={errors?.accountName?.message as string}
						/>
					)}
				/>
				<Controller
					name="bankCode"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="銀行代碼"
							variant="outlined"
							fullWidth
							error={!!errors.bankCode}
							helperText={errors?.bankCode?.message as string}
						/>
					)}
				/>
				<Controller
					name="accountCode"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="銀行號碼"
							variant="outlined"
							fullWidth
							error={!!errors.accountCode}
							helperText={errors?.accountCode?.message as string}
						/>
					)}
				/>
				<Controller
					name="isQuoted"
					control={control}
					render={({ field }) => (
						<FormControlLabel
							control={
								<Checkbox
									checked={field.value || false}
									onChange={(e) => field.onChange(e.target.checked)}
								/>
							}
							label="有無B2B報價"
						/>
					)}
				/>
			</div>
		</div>
	);
}

export default BasicInfoTab;
