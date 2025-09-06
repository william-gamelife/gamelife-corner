import { useMemo } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Chip, Typography } from '@mui/material';
import Link from '@fuse/core/Link';
import { useGetUsersQuery } from './UserApi';
import { User } from '@auth/user';
import { format } from 'date-fns';

function UsersTable() {
	const { data: users, isLoading, isFetching } = useGetUsersQuery();

	const columns = useMemo<MRT_ColumnDef<User>[]>(
		() => [
			{
				accessorKey: 'id',
				header: '員工編號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/users/${row.original.id}`}
					>
						<u>{row.original.id}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'displayName',
				header: '顯示名稱'
			},
			{
				accessorKey: 'employeeName',
				header: '員工姓名'
			},
			{
				accessorKey: 'title',
				header: '職稱'
			},
			{
				accessorKey: 'startOfDuty',
				header: '到職日',
				Cell: ({ row }) => (
					<Typography>
						{row.original.startOfDuty ? format(new Date(row.original.startOfDuty), 'yyyy-MM-dd') : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'roles',
				header: '角色',
				Cell: ({ row }) => (
					<div className="flex gap-1">
						{Array.isArray(row.original.roles) ? (
							row.original.roles.map((role, index) => (
								<Chip
									key={index}
									label={role}
									size="small"
									color="primary"
								/>
							))
						) : typeof row.original.roles === 'string' ? (
							<Chip
								label={row.original.roles}
								size="small"
								color="primary"
							/>
						) : null}
					</div>
				)
			}
		],
		[]
	);

	if (isLoading || isFetching) {
		return <FuseLoading />;
	}

	return (
		<DataTable
			tableId="users-table"
			data={users}
			columns={columns}
			enableRowActions={false}
			enableRowSelection={false}
		/>
	);
}

export default UsersTable;
