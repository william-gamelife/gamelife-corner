'use client';

import { useMemo, useState, useEffect } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import { Typography, Paper } from '@mui/material';
import Link from '@fuse/core/Link';
import Button from '@mui/material/Button';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetOrdersQuery } from './OrderApi';
import { Order } from './OrderApi';
import OrderSearchDialog from './components/OrderSearchDialog';

const STORAGE_KEY = 'orderSearchParams';

function OrdersTable() {
	const [searchDialogOpen, setSearchDialogOpen] = useState(false);
	const [searchParams, setSearchParams] = useState(() => {
		// 從 localStorage 讀取儲存的搜尋參數，如果沒有則使用預設值
		const savedParams = localStorage.getItem(STORAGE_KEY);
		return savedParams
			? JSON.parse(savedParams)
			: {
					limit: 200
				};
	});

	const {
		data: orders,
		isLoading,
		isFetching
	} = useGetOrdersQuery({
		...searchParams,
		excludeCompletedGroups: true
	});

	// 當搜尋參數改變時，保存到 localStorage
	useEffect(() => {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(searchParams));
	}, [searchParams]);

	const columns = useMemo<MRT_ColumnDef<Order>[]>(
		() => [
			{
				accessorKey: 'orderNumber',
				header: '訂單編號',
				Cell: ({ row }) => (
					<Typography
						component={Link}
						to={`/orders/${row.original.orderNumber}`}
					>
						<u>{row.original.orderNumber}</u>
					</Typography>
				)
			},
			{
				accessorKey: 'groupCode',
				header: '團號'
			},
			{
				accessorKey: 'groupName',
				header: '團名'
			},
			{
				accessorKey: 'contactPerson',
				header: '聯絡人'
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
				tableId="orders-table"
				data={(orders as Order[]) || []}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
				renderTopToolbarCustomActions={() => (
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
				)}
			/>
			<OrderSearchDialog
				open={searchDialogOpen}
				onClose={() => setSearchDialogOpen(false)}
				onSearch={setSearchParams}
				initialParams={searchParams}
			/>
		</Paper>
	);
}

export default OrdersTable;
