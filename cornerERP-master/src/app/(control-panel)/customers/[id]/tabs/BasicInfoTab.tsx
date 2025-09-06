'use client';

import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { Box } from '@mui/material';
import { useParams } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { formatDateForAPI } from '@/utils/timezone';

interface BasicInfoTabProps {
	isNewCustomer: boolean;
}

/**
 * The basic info tab.
 */
function BasicInfoTab({ isNewCustomer }: BasicInfoTabProps) {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	const routeParams = useParams<{ id: string }>();
	const { id: customerId } = routeParams;

	return (
		<Box>
			{/* 基本資料區塊 */}
			<Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{/* 姓名 */}
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							required
							label="姓名"
							variant="outlined"
							fullWidth
							autoFocus
							error={!!errors.name}
							helperText={errors?.name?.message as string}
							placeholder="請輸入姓名"
						/>
					)}
				/>

				{/* 身份證號 */}
				<Controller
					name="id"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="身份證號"
							variant="outlined"
							fullWidth
							disabled={!isNewCustomer}
							required={isNewCustomer}
							error={!!errors.id}
							helperText={errors?.id?.message as string}
							placeholder={isNewCustomer ? '請輸入身份證號' : ''}
						/>
					)}
				/>

				{/* 生日 */}
				<Controller
					name="birthday"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="生日"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : null}
							onChange={(date) => field.onChange(formatDateForAPI(date) || '')}
							slotProps={{
								textField: {
									fullWidth: true,
									variant: 'outlined',
									error: !!errors.birthday,
									helperText: errors?.birthday?.message as string
								}
							}}
						/>
					)}
				/>

				{/* 護照拼音 */}
				<Controller
					name="passportRomanization"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label="護照拼音"
							variant="outlined"
							fullWidth
							error={!!errors.passportRomanization}
							helperText={errors?.passportRomanization?.message as string}
							placeholder="請輸入護照拼音"
						/>
					)}
				/>

				{/* 護照號碼 */}
				<Controller
					name="passportNumber"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label="護照號碼"
							variant="outlined"
							fullWidth
							error={!!errors.passportNumber}
							helperText={errors?.passportNumber?.message as string}
							placeholder="請輸入護照號碼"
						/>
					)}
				/>

				{/* 護照效期訖 */}
				<Controller
					name="passportValidTo"
					control={control}
					render={({ field }) => (
						<DatePicker
							{...field}
							label="護照效期訖"
							format="yyyy-MM-dd"
							value={field.value ? new Date(field.value) : null}
							onChange={(date) => field.onChange(formatDateForAPI(date) || '')}
							slotProps={{
								textField: {
									fullWidth: true,
									variant: 'outlined',
									error: !!errors.passportValidTo,
									helperText: errors?.passportValidTo?.message as string
								}
							}}
						/>
					)}
				/>

				{/* 聯絡電話 */}
				<Controller
					name="phone"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label="聯絡電話"
							variant="outlined"
							fullWidth
							error={!!errors.phone}
							helperText={errors?.phone?.message as string}
							placeholder="請輸入電話號碼"
						/>
					)}
				/>

				{/* 電子郵件 */}
				<Controller
					name="email"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label="電子郵件"
							variant="outlined"
							fullWidth
							type="email"
							error={!!errors.email}
							helperText={errors?.email?.message as string}
							placeholder="請輸入 Email"
						/>
					)}
				/>

				<Controller
					name="note"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							value={field.value || ''}
							label="備註"
							variant="outlined"
							fullWidth
							multiline
							rows={4}
							error={!!errors.note}
							helperText={errors?.note?.message as string}
							placeholder="請輸入備註"
							sx={{ gridColumn: { md: 'span 2' } }}
						/>
					)}
				/>
			</Box>
		</Box>
	);
}

export default BasicInfoTab;
