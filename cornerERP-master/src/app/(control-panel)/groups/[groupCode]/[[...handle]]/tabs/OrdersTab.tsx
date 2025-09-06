import { useMemo, useState } from 'react';
import { type MRT_ColumnDef } from 'material-react-table';
import DataTable from 'src/components/data-table/DataTable';
import FuseLoading from '@fuse/core/FuseLoading';
import {
	Typography,
	Drawer,
	IconButton,
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Alert
} from '@mui/material';
import Link from '@fuse/core/Link';
import { useParams } from 'next/navigation';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { useGetOrdersByGroupCodeQuery, useDeleteOrderMutation } from '@/app/(control-panel)/orders/OrderApi';
import { Order } from '@/app/(control-panel)/orders/OrderApi';
import { useGetGroupQuery } from '@/app/(control-panel)/groups/GroupApi';
import { GROUP_STATUSES } from '@/constants/groupStatuses';
import OrderForm from './OrderForm';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';

function OrdersTab() {
	const routeParams = useParams<{ groupCode: string }>();
	const { groupCode } = routeParams;
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
	const { getUserName } = useUserDictionary();
	const { data: orders, isLoading } = useGetOrdersByGroupCodeQuery(groupCode);
	const { data: group } = useGetGroupQuery(groupCode);
	const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

	// 判斷團體是否已結團
	const isGroupCompleted = group?.status === GROUP_STATUSES.COMPLETED;

	const handleAddOrder = () => {
		setSelectedOrder(null);
		setDrawerOpen(true);
	};

	const handleEditOrder = (order: Order) => {
		setSelectedOrder(order);
		setDrawerOpen(true);
	};

	const handleCloseDrawer = () => {
		setDrawerOpen(false);
	};

	const handleDeleteOrder = (order: Order) => {
		setOrderToDelete(order);
		setDeleteDialogOpen(true);
	};

	const handleConfirmDelete = async () => {
		if (!orderToDelete) return;

		try {
			await deleteOrder(orderToDelete.orderNumber).unwrap();
			setDeleteDialogOpen(false);
			setOrderToDelete(null);
		} catch (error) {
			console.error('刪除訂單失敗:', error);
		}
	};

	const handleCancelDelete = () => {
		setDeleteDialogOpen(false);
		setOrderToDelete(null);
	};

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
				accessorKey: 'contactPerson',
				header: '聯絡人'
			},
			{
				accessorKey: 'contactPhone',
				header: '聯絡電話'
			},
			{
				accessorKey: 'salesPerson',
				header: '業務',
				Cell: ({ row }) => (
					<Typography>{row.original.salesPerson ? getUserName(row.original.salesPerson) : ''}</Typography>
				)
			},
			{
				accessorKey: 'opId',
				header: 'Op',
				Cell: ({ row }) => <Typography>{row.original.opId ? getUserName(row.original.opId) : ''}</Typography>
			},
			{
				id: 'actions',
				header: '操作',
				Cell: ({ row }) => (
					<div className="flex gap-1">
						{!isGroupCompleted && (
							<>
								<IconButton
									onClick={() => handleEditOrder(row.original)}
									size="small"
									color="primary"
								>
									<FuseSvgIcon>heroicons-outline:pencil</FuseSvgIcon>
								</IconButton>
								<IconButton
									onClick={() => handleDeleteOrder(row.original)}
									size="small"
									color="error"
								>
									<FuseSvgIcon>heroicons-outline:trash</FuseSvgIcon>
								</IconButton>
							</>
						)}
						{isGroupCompleted && (
							<Typography
								variant="body2"
								color="text.secondary"
							>
								已結團
							</Typography>
						)}
					</div>
				)
			}
		],
		[isGroupCompleted]
	);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<>
			{!isGroupCompleted && (
				<div className="flex justify-end mb-4">
					<Button
						variant="contained"
						color="secondary"
						onClick={handleAddOrder}
						startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
					>
						新增訂單
					</Button>
				</div>
			)}
			{isGroupCompleted && (
				<div className="flex justify-end mb-4">
					<Alert
						severity="info"
						className="flex-1"
					>
						此團體已結團，無法新增、編輯或刪除訂單
					</Alert>
				</div>
			)}

			<DataTable
				data={orders || []}
				columns={columns}
				enableRowActions={false}
				enableRowSelection={false}
			/>

			<Drawer
				anchor="right"
				open={drawerOpen}
				onClose={handleCloseDrawer}
				PaperProps={{
					sx: { width: { xs: '100%', sm: 480 } }
				}}
			>
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<Typography variant="h6">{selectedOrder ? '編輯訂單' : '新增訂單'}</Typography>
						<IconButton
							onClick={handleCloseDrawer}
							size="large"
						>
							<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
						</IconButton>
					</div>

					<OrderForm
						order={selectedOrder}
						groupCode={groupCode}
						onClose={handleCloseDrawer}
					/>
				</div>
			</Drawer>

			{/* 刪除確認對話框 */}
			<Dialog
				open={deleteDialogOpen}
				onClose={handleCancelDelete}
				maxWidth="sm"
				fullWidth
			>
				<DialogTitle>刪除訂單</DialogTitle>
				<DialogContent>
					<Alert
						severity="warning"
						className="mb-4"
					>
						此操作無法復原，確定要刪除此訂單嗎？
					</Alert>
					{orderToDelete && (
						<Typography>
							訂單編號：{orderToDelete.orderNumber}
							<br />
							聯絡人：{orderToDelete.contactPerson}
							<br />
							聯絡電話：{orderToDelete.contactPhone}
						</Typography>
					)}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleCancelDelete}
						disabled={isDeleting}
					>
						取消
					</Button>
					<Button
						onClick={handleConfirmDelete}
						color="error"
						variant="contained"
						disabled={isDeleting}
					>
						{isDeleting ? '刪除中...' : '確定刪除'}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
}

export default OrdersTab;
