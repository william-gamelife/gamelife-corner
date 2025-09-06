import TextField from '@mui/material/TextField';
import { Controller, useFormContext } from 'react-hook-form';
import { Autocomplete } from '@mui/material';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useGetGroupsQuery, Group } from '@/app/(control-panel)/groups/GroupApi';

function BasicInfoTab() {
	const methods = useFormContext();
	const { control, formState } = methods;
	const { errors } = formState;
	const { users } = useUserDictionary();
	const { data: groups = [] } = useGetGroupsQuery({
		excludeCompletedGroups: true
	}) as { data: Group[] };

	const opOptions = users.map((user) => ({
		id: user.id,
		label: `${user.displayName}`
	}));

	const groupOptions = groups.map((group) => ({
		id: group.groupCode,
		label: `${group.groupCode} - ${group.groupName}`
	}));

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

							return option.label;
						}}
						value={field.value ? groupOptions.find((option) => option.id === field.value) || null : null}
						onChange={(_, newValue) => {
							field.onChange(newValue ? newValue.id : null);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="團號"
								variant="outlined"
								fullWidth
								error={!!errors.groupCode}
								helperText={errors?.groupCode?.message as string}
								required
							/>
						)}
					/>
				)}
			/>

			<Controller
				name="orderNumber"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						label="訂單編號"
						autoFocus
						variant="outlined"
						fullWidth
						disabled
					/>
				)}
			/>

			<Controller
				name="contactPerson"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						required
						label="聯絡人"
						variant="outlined"
						fullWidth
						error={!!errors.contactPerson}
						helperText={errors?.contactPerson?.message as string}
					/>
				)}
			/>

			<Controller
				name="contactPhone"
				control={control}
				render={({ field }) => (
					<TextField
						{...field}
						required
						label="聯絡電話"
						variant="outlined"
						fullWidth
						error={!!errors.contactPhone}
						helperText={errors?.contactPhone?.message as string}
					/>
				)}
			/>

			<Controller
				name="salesPerson"
				control={control}
				render={({ field }) => (
					<Autocomplete
						{...field}
						options={opOptions}
						getOptionLabel={(option) => {
							if (typeof option === 'string') {
								return option;
							}

							return option.label;
						}}
						value={field.value ? opOptions.find((option) => option.id === field.value) || null : null}
						onChange={(_, newValue) => {
							field.onChange(newValue ? newValue.id : null);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="業務員"
								variant="outlined"
								fullWidth
								error={!!errors.salesPerson}
								helperText={errors?.salesPerson?.message as string}
								required
							/>
						)}
					/>
				)}
			/>

			<Controller
				name="opId"
				control={control}
				render={({ field }) => (
					<Autocomplete
						{...field}
						options={opOptions}
						getOptionLabel={(option) => {
							if (typeof option === 'string') {
								return option;
							}

							return option.label;
						}}
						value={field.value ? opOptions.find((option) => option.id === field.value) || null : null}
						onChange={(_, newValue) => {
							field.onChange(newValue ? newValue.id : null);
						}}
						renderInput={(params) => (
							<TextField
								{...params}
								label="OP員"
								variant="outlined"
								fullWidth
								error={!!errors.opId}
								helperText={errors?.opId?.message as string}
							/>
						)}
					/>
				)}
			/>
		</div>
	);
}

export default BasicInfoTab;
