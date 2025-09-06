import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Chip, FormControl, InputLabel, MenuItem, Select, Button, Typography } from '@mui/material';
import Image from 'next/image';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useParams } from 'next/navigation';
import { compressImage, convertToBase64 } from '@/utils/tools';
import useUser from '@auth/useUser';
import FuseUtils from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';

function BasicInfoTab() {
	const { data: user } = useUser();
	const userRole = user?.roles;
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	const params = useParams();
	const isNewUser = params.id === 'new';

	const roleOptions = ['admin', 'user', 'accountant'];

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
			<Controller
				name="id"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label="員工編號"
						autoFocus={isNewUser}
						variant="outlined"
						fullWidth
						required
						disabled={!isNewUser}
						error={!!errors.id}
						helperText={errors?.id?.message as string}
					/>
				)}
			/>

			<Controller
				name="displayName"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label="顯示名稱"
						variant="outlined"
						fullWidth
						required
						error={!!errors.displayName}
						helperText={errors?.displayName?.message as string}
					/>
				)}
			/>

			<Controller
				name="employeeName"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label="員工姓名"
						variant="outlined"
						fullWidth
						error={!!errors.employeeName}
						helperText={errors?.employeeName?.message as string}
					/>
				)}
			/>

			{Boolean(FuseUtils.hasPermission(authRoles.accountant, userRole)) && (
				<>
					<Controller
						name="title"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="職稱"
								variant="outlined"
								fullWidth
								error={!!errors.title}
								helperText={errors?.title?.message as string}
							/>
						)}
					/>

					<Controller
						name="idNumber"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="身份證號"
								variant="outlined"
								fullWidth
								error={!!errors.idNumber}
								helperText={errors?.idNumber?.message as string}
							/>
						)}
					/>

					<Controller
						name="birthday"
						control={control}
						render={({ field }) => (
							<DatePicker
								{...field}
								label="生日"
								format="yyyy-MM-dd"
								value={field.value ? new Date(field.value) : null}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.birthday,
										helperText: errors?.birthday?.message as string
									}
								}}
							/>
						)}
					/>

					<Controller
						name="startOfDuty"
						control={control}
						render={({ field }) => (
							<DatePicker
								{...field}
								label="到職日期"
								format="yyyy-MM-dd"
								value={field.value ? new Date(field.value) : null}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.startOfDuty,
										helperText: errors?.startOfDuty?.message as string
									}
								}}
							/>
						)}
					/>

					<Controller
						name="endOfDuty"
						control={control}
						render={({ field }) => (
							<DatePicker
								{...field}
								label="離職日期"
								format="yyyy-MM-dd"
								value={field.value ? new Date(field.value) : null}
								slotProps={{
									textField: {
										fullWidth: true,
										error: !!errors.endOfDuty,
										helperText: errors?.endOfDuty?.message as string
									}
								}}
							/>
						)}
					/>

					<Controller
						name="roles"
						control={control}
						render={({ field: { onChange, value } }) => (
							<FormControl fullWidth>
								<InputLabel>角色</InputLabel>
								<Select
									multiple
									value={value || []}
									onChange={onChange}
									renderValue={(selected) => (
										<div className="flex gap-1">
											{selected.map((value) => (
												<Chip
													key={value}
													label={value}
												/>
											))}
										</div>
									)}
								>
									{roleOptions.map((role) => (
										<MenuItem
											key={role}
											value={role}
										>
											{role}
										</MenuItem>
									))}
								</Select>
							</FormControl>
						)}
					/>
				</>
			)}
			<Controller
				name="password"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						type="password"
						label="密碼"
						variant="outlined"
						fullWidth
						required={isNewUser}
						error={!!errors.password}
						helperText={errors?.password?.message as string}
					/>
				)}
			/>

			<Controller
				name="note"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label="備註"
						variant="outlined"
						fullWidth
						multiline
						rows={3}
						error={!!errors.note}
						helperText={errors?.note?.message as string}
					/>
				)}
			/>

			<Controller
				name="photoUrl"
				control={control}
				render={({ field: { onChange, value } }) => (
					<div className="space-y-2">
						{value && (
							<Image
								src={value}
								alt="用戶照片"
								width={128}
								height={128}
								className="object-cover rounded-lg"
							/>
						)}
						<Button
							variant="contained"
							color="secondary"
							component="label"
							className="h-36"
							fullWidth
						>
							<input
								type="file"
								hidden
								accept="image/*"
								onChange={async (e) => {
									const file = (e.target as HTMLInputElement).files?.[0];

									if (file) {
										const compressedFile = await compressImage(file, 0.2);
										const base64 = await convertToBase64(compressedFile);
										onChange(base64);
									}
								}}
							/>
							<div className="flex items-center gap-2">
								<FuseSvgIcon
									className="text-24"
									size={24}
								>
									heroicons-outline:camera
								</FuseSvgIcon>
								<Typography>上傳照片</Typography>
								{errors.photoUrl && (
									<Typography
										color="error"
										className="mt-1 text-sm"
									>
										{errors.photoUrl.message as string}
									</Typography>
								)}
							</div>
						</Button>
					</div>
				)}
			/>
		</div>
	);
}

export default BasicInfoTab;
