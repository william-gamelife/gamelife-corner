import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Paper, Button } from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useDeleteBillsMutation, useGetBillsQuery } from './BillApi';
import { Bill } from './BillApi';
import { useUserDictionary } from '../users/hooks/useUserDictionary';
import { BILL_STATUSES, getBillStatusName } from 'src/constants/billStatuses';
import { format } from 'date-fns';
import BillSearchDialog from './components/BillSearchDialog';

const STORAGE_KEY = 'billSearchParams';

function BillsTable() {
	const { getUserName } = useUserDictionary();
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					status: [BILL_STATUSES.CONFIRMED],
					limit: 200
				};
	});

	const { data: bills = [], isLoading, isFetching } = useGetBillsQuery(searchParams);
	const [removeBills] = useDeleteBillsMutation();

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Bill>[]>(
		() => [
			{
				accessorKey: 'billNumber',
				header: '出納單號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/bills/${row.original.billNumber}`}
					>
						<u>{row.original.billNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'billDate',
				header: '出帳日期',
				Cell: ({ row }) => (
					<Typography>
						{row.original.billDate ? format(new Date(row.original.billDate), 'yyyy-MM-dd') : ''}
					</Typography>
				)
			},
			{
				accessorKey: 'status',
				header: '狀態',
				Cell: ({ row }) => <Typography>{getBillStatusName(row.original.status)}</Typography>
			},
			{
				accessorKey: 'createdBy',
				header: '創建人員',
				Cell: ({ row }) => <Typography>{getUserName(row.original.createdBy)}</Typography>
			}
		],
		[getUserName]
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
				tableId="bills-table"
				data={bills}
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
									removeBills(selectedRows.map((row) => row.original.billNumber));
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
			<BillSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default BillsTable;
