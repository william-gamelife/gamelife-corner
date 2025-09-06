import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Chip, Paper, Button } from '@mui/material';
import Link from '@fuse/core/Link';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetInvoicesQuery, useDeleteInvoicesMutation } from './InvoiceApi';
import { Invoice } from './InvoiceApi';
import { getInvoiceStatusName, getInvoiceStatusColor, INVOICE_STATUS } from 'src/constants/invoiceStatus';
import InvoiceSearchDialog from './components/InvoiceSearchDialog';

const STORAGE_KEY = 'invoiceSearchParams';

function InvoicesTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					status: [INVOICE_STATUS.PENDING],
					limit: 200
				};
	});

	const { data: invoices = [], isLoading } = useGetInvoicesQuery(searchParams);
	const [removeInvoices] = useDeleteInvoicesMutation();

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Invoice>[]>(
		() => [
			{
				accessorKey: 'invoiceNumber',
				header: '請款單號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/invoices/${row.original.invoiceNumber}`}
					>
						<u>{row.original.invoiceNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'group.groupName',
				header: '團名',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/groups/${row.original.groupCode}`}
					>
						<u>
							{row.original.groupCode}-{row.original.group?.groupName}
						</u>
					</Typography>
				)
			},
			{
				accessorKey: 'orderNumber',
				header: '訂單編號',
				Cell: ({ row }) =>
					row.original.orderNumber ? (
						<Typography
							component={Link}
							to={`/orders/${row.original.orderNumber}`}
						>
							<u>{row.original.orderNumber}</u>
						</Typography>
					) : null
			},
			{
				accessorKey: 'invoiceDate',
				header: '請款日期',
				accessorFn: (row) => row.invoiceDate
			},
			{
				accessorKey: 'amount',
				header: '金額',
				accessorFn: (row) =>
					row.invoiceItems?.reduce((acc, item) => acc + item.price * item.quantity, 0).toLocaleString()
			},
			{
				accessorKey: 'status',
				header: '狀態',
				Cell: ({ row }) => {
					const status = row.original.status;
					return (
						<Chip
							label={getInvoiceStatusName(status)}
							color="default"
							size="small"
							sx={{
								color: 'white',
								bgcolor: getInvoiceStatusColor(status)
							}}
						/>
					);
				}
			}
		],
		[]
	);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<Paper
			className="flex flex-col flex-auto shadow-1 rounded-t-lg overflow-hidden rounded-b-none w-full h-full"
			elevation={0}
		>
			<DataTable
				tableId="invoices-table"
				data={invoices}
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
									removeInvoices(selectedRows.map((row) => row.original.invoiceNumber));
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
			<InvoiceSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default InvoicesTable;
