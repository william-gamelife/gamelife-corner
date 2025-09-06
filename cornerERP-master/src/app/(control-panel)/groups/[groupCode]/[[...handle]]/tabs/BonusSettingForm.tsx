import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
	Button,
	TextField,
	FormControl,
	FormHelperText,
	InputLabel,
	MenuItem,
	Select,
	CircularProgress,
	Autocomplete
} from '@mui/material';
import {
	useCreateGroupBonusSettingMutation,
	useUpdateGroupBonusSettingMutation,
	GroupBonusSetting
} from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import {
	BONUS_SETTING_TYPES,
	BONUS_SETTING_TYPE_OPTIONS,
	BONUS_CALCULATION_TYPES,
	BONUS_CALCULATION_TYPE_OPTIONS
} from '@/constants/bonusSettingTypes';

// 表單驗證模式
const schema = z.object({
	type: z.number().min(0).max(4),
	bonus: z.number().min(0, '獎金不能為負數'),
	employeeCode: z.string().optional(),
	bonusType: z.number().min(0).max(3)
});

type FormValues = z.infer<typeof schema>;

interface BonusSettingFormProps {
	setting: GroupBonusSetting | null;
	groupCode: string;
	onClose: () => void;
}

function BonusSettingForm({ setting, groupCode, onClose }: BonusSettingFormProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { users } = useUserDictionary();

	const [createBonusSetting] = useCreateGroupBonusSettingMutation();
	const [updateBonusSetting] = useUpdateGroupBonusSettingMutation();

	// 將 users 轉換為選項陣列
	const employeeOptions = users.map((user) => ({
		id: user.id,
		label: `${user.displayName}`
	}));

	const defaultValues: FormValues = {
		type: setting?.type ?? BONUS_SETTING_TYPES.PROFIT_TAX,
		bonus: setting?.bonus ?? 0,
		employeeCode: setting?.employeeCode ?? '',
		bonusType: setting?.bonusType ?? BONUS_CALCULATION_TYPES.PERCENT
	};

	const {
		control,
		handleSubmit,
		formState: { errors }
	} = useForm<FormValues>({
		resolver: zodResolver(schema),
		defaultValues
	});

	const onSubmit = async (data: FormValues) => {
		try {
			setIsSubmitting(true);

			if (setting?.id) {
				// 更新現有設定
				await updateBonusSetting({
					id: setting.id,
					groupCode: groupCode,
					type: data.type,
					bonus: data.bonus,
					employeeCode: data.employeeCode,
					bonusType: data.bonusType,
					modifiedAt: new Date(),
					modifiedBy: '', // 這裡可能需要從用戶上下文獲取
					// 其他欄位保持不變
					createdBy: setting.createdBy,
					createdAt: setting.createdAt
				});
			} else {
				// 創建新設定
				await createBonusSetting({
					groupCode: groupCode,
					type: data.type,
					bonus: data.bonus,
					employeeCode: data.employeeCode,
					bonusType: data.bonusType,
					createdAt: new Date(),
					createdBy: '' // 這裡可能需要從用戶上下文獲取
				});
			}

			onClose();
		} catch (error) {
			console.error('提交表單時出錯:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="space-y-4"
		>
			<Controller
				name="type"
				control={control}
				render={({ field }) => (
					<FormControl
						fullWidth
						error={!!errors.type}
					>
						<InputLabel>類型</InputLabel>
						<Select
							{...field}
							label="類型"
							required
						>
							{BONUS_SETTING_TYPE_OPTIONS.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</MenuItem>
							))}
						</Select>
						{errors.type && <FormHelperText>{errors.type.message as string}</FormHelperText>}
					</FormControl>
				)}
			/>

			<Controller
				name="bonusType"
				control={control}
				render={({ field }) => (
					<FormControl
						fullWidth
						error={!!errors.bonusType}
					>
						<InputLabel>獎金類型</InputLabel>
						<Select
							{...field}
							label="獎金類型"
							required
						>
							{BONUS_CALCULATION_TYPE_OPTIONS.map((option) => (
								<MenuItem
									key={option.value}
									value={option.value}
								>
									{option.label}
								</MenuItem>
							))}
						</Select>
						{errors.bonusType && <FormHelperText>{errors.bonusType.message as string}</FormHelperText>}
					</FormControl>
				)}
			/>

			<Controller
				name="bonus"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						required
						type="number"
						label="獎金"
						variant="outlined"
						fullWidth
						error={!!errors.bonus}
						helperText={errors?.bonus?.message as string}
						onChange={(e) => {
							const value = e.target.value;
							field.onChange(value ? Number(value) : 0);
						}}
					/>
				)}
			/>

			<Controller
				name="employeeCode"
				control={control}
				render={({ field }) => (
					<Autocomplete
						options={employeeOptions}
						getOptionLabel={(option) => {
							if (typeof option === 'string') {
								const foundOption = employeeOptions.find((o) => o.id === option);
								return foundOption ? foundOption.label : option;
							}

							return option.label;
						}}
						value={field.value ? employeeOptions.find((option) => option.id === field.value) || null : null}
						onChange={(_, newValue) => {
							field.onChange(newValue ? newValue.id : '');
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="對應員工"
								variant="outlined"
								fullWidth
								error={!!errors.employeeCode}
								helperText={errors?.employeeCode?.message as string}
							/>
						)}
					/>
				)}
			/>

			<div className="flex justify-end space-x-2 pt-4">
				<Button
					variant="outlined"
					onClick={onClose}
					disabled={isSubmitting}
				>
					取消
				</Button>
				<Button
					type="submit"
					variant="contained"
					color="primary"
					disabled={isSubmitting}
					startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
				>
					{setting ? '更新' : '新增'}
				</Button>
			</div>
		</form>
	);
}

export default BonusSettingForm;
