import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Chip, Paper } from '@mui/material';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import Link from '@fuse/core/Link';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { useDeleteGroupsMutation, useGetGroupsQuery } from './GroupApi';
import { Group } from './GroupApi';
import { GROUP_STATUS_NAMES, GROUP_STATUS_COLORS, GROUP_STATUSES } from '@/constants/groupStatuses';
import GroupSearchDialog from './components/GroupSearchDialog';

const STORAGE_KEY = 'groupSearchParams';

function GroupsTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					status: [GROUP_STATUSES.IN_PROGRESS, GROUP_STATUSES.SPECIAL],
					limit: 200
				};
	});

	const { data: groups, isLoading, isFetching } = useGetGroupsQuery(searchParams);
	const [removeGroups] = useDeleteGroupsMutation();

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Group>[]>(
		() => [
			{
				accessorKey: 'groupCode',
				header: '團號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/groups/${row.original.groupCode}`}
					>
						<u>{row.original.groupCode}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'groupName',
				header: '團名'
			},
			{
				accessorKey: 'departureDate',
				header: '出發日期',
				accessorFn: (row) => row.departureDate
			},
			{
				accessorKey: 'returnDate',
				header: '回程日期',
				accessorFn: (row) => row.returnDate
			},
			{
				accessorKey: 'salesPerson',
				header: '業務員'
			},
			{
				accessorKey: 'op',
				header: 'OP員'
			},
			{
				accessorKey: 'status',
				header: '狀態',
				Cell: ({ row }) => {
					const status = row.original.status;

					// 獲取狀態名稱和顏色
					const statusName = GROUP_STATUS_NAMES[status] || '未知狀態';
					const statusColor = GROUP_STATUS_COLORS[status] || 'default';

					return (
						<Chip
							label={statusName}
							color={statusColor}
							size="small"
						/>
					);
				}
			}
		],
		[]
	);

	if (isLoading || isFetching) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-none w-full h-full"
			elevation={0}
		>
			<DataTable
				tableId="groups-table"
				data={groups}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
				renderTopToolbarCustomActions={({ table }) => {
					const { rowSelection } = table.getState();

					if (Object.keys(rowSelection).length === 0) {
						return (
							<div className="flex gap-2">
								<Button
									variant="contained"
									size="small"
									onClick={() => setSearchDialogOpen(true)}
									className="flex items-center"
									color="primary"
								>
									<FuseSvgIcon size={16}>heroicons-outline:magnifying-glass</FuseSvgIcon>
									<span className="hidden sm:flex mx-2">詳細搜尋</span>
								</Button>
							</div>
						);
					}

					return (
						<div className="flex gap-2">
							<Button
								variant="contained"
								size="small"
								onClick={() => {
									const selectedRows = table.getSelectedRowModel().rows;
									removeGroups(selectedRows.map((row) => row.original.groupCode));
									table.resetRowSelection();
								}}
								className="flex shrink min-w-9 ltr:mr-2 rtl:ml-2"
								color="secondary"
							>
								<FuseSvgIcon size={16}>heroicons-outline:trash</FuseSvgIcon>
								<span className="hidden sm:flex mx-2">刪除選定項目</span>
							</Button>
						</div>
					);
				}}
			/>
			<GroupSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default GroupsTable;
