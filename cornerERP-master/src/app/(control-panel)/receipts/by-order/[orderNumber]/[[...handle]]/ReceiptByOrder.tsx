'use client';

import { useState, useEffect, Fragment } from 'react';
import { useParams } from 'next/navigation';
import FuseLoading from '@fuse/core/FuseLoading';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import { motion } from 'motion/react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import FusePageCarded from '@fuse/core/FusePageCarded';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useGetReceiptsByOrderNumberQuery, useGetReceiptQuery, useUpdateReceiptMutation } from '../../../ReceiptApi';
import type { Receipt } from '../../../ReceiptApi';
import { useGetOrderQuery } from 'src/app/(control-panel)/orders/OrderApi';
import { useCreateLinkPayHandler } from '../../../hooks/useCreateLinkPayHandler';
import ReceiptByOrderHeader from './ReceiptByOrderHeader';
import ReceiptByOrderTable from './ReceiptByOrderTable';
import ReceiptByOrderForm from './ReceiptByOrderForm';
import { RECEIPT_TYPES } from 'src/constants/receiptTypes';
import { RECEIPT_STATUS } from 'src/constants/receiptStatus';
import { createReceiptSchema } from '../../../schemas/receiptSchema';

// 定義表單數據類型
export type ReceiptFormData = {
	receiptNumber: string;
	orderNumber: string;
	receiptDate: string | Date;
	receiptAmount: number;
	actualAmount: number;
	receiptType: number;
	receiptAccount?: string;
	payDateline?: string | Date;
	email?: string;
	note?: string;
	status: number;
};

// 使用共用 schema，並指定包含收款編號、狀態必填和實際金額
const schema = createReceiptSchema({
	includeReceiptNumber: true,
	statusRequired: true,
	includeActualAmount: true
});

/**
 * 根據訂單號碼獲取並顯示收款清單，可彈窗編輯
 */
export default function ReceiptByOrder() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const { orderNumber } = useParams<{ orderNumber: string }>();
	const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
	const [updateReceipt] = useUpdateReceiptMutation();

	// 使用共用的 LinkPay 創建 hook
	const { handleCreateLinkPay, isCreating } = useCreateLinkPayHandler();

	const { data: receipts, isLoading, isError } = useGetReceiptsByOrderNumberQuery(orderNumber);

	const { data: receiptDetail, isLoading: isLoadingDetail } = useGetReceiptQuery(selectedReceipt || '', {
		skip: !selectedReceipt
	});

	const { data: orderDetail, isLoading: isLoadingOrder } = useGetOrderQuery(orderNumber, {
		skip: !orderNumber
	});

	const methods = useForm<ReceiptFormData>({
		mode: 'onChange',
		resolver: zodResolver(schema),
		defaultValues: {
			receiptType: RECEIPT_TYPES.BANK_TRANSFER,
			status: RECEIPT_STATUS.PENDING
		}
	});

	const {
		reset,
		handleSubmit,
		formState: { isValid, dirtyFields }
	} = methods;

	const handleEditClick = (receiptNumber: string) => {
		setSelectedReceipt(receiptNumber);
		setIsEditDialogOpen(true);
	};

	const handleCloseDialog = () => {
		setIsEditDialogOpen(false);
		setSelectedReceipt(null);
		reset({
			receiptType: RECEIPT_TYPES.BANK_TRANSFER,
			status: RECEIPT_STATUS.PENDING
		});
	};

	const onSubmit = async (data: ReceiptFormData) => {
		try {
			// 如果是 LinkPay 類型，檢查必填欄位
			if (data.receiptType === RECEIPT_TYPES.LINK_PAY) {
				if (!data.email) {
					console.log('LinkPay 付款方式必須填寫 Email');
					return;
				}

				if (!data.receiptAccount) {
					console.log('LinkPay 付款方式必須填寫收款帳號');
					return;
				}

				if (!data.payDateline) {
					console.log('LinkPay 付款方式必須填寫付款截止日');
					return;
				}

				// 如果是新建的 LinkPay 收據，自動創建 LinkPay
				if (data.status === RECEIPT_STATUS.PENDING) {
					await handleCreateLinkPay(data.receiptNumber, data.receiptAccount, data.email);
				}
			}

			// 如果是銀行轉帳，檢查收款帳號
			if (data.receiptType === RECEIPT_TYPES.BANK_TRANSFER && !data.receiptAccount) {
				console.log('銀行轉帳付款方式必須填寫收款帳號');
				return;
			}

			const updatedData = {
				...data,
				receiptType: data.receiptType ?? RECEIPT_TYPES.BANK_TRANSFER,
				status: data.status ?? RECEIPT_STATUS.PENDING
			};

			await updateReceipt(updatedData as Receipt).unwrap();
			handleCloseDialog();
		} catch (error) {
			console.error('更新收款時發生錯誤:', error);
		}
	};

	useEffect(() => {
		if (receiptDetail) {
			const formData = {
				...receiptDetail,
				receiptType: receiptDetail.receiptType ?? RECEIPT_TYPES.BANK_TRANSFER,
				status: receiptDetail.status ?? RECEIPT_STATUS.PENDING
			} as ReceiptFormData;

			reset(formData);
		}
	}, [receiptDetail, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError || (receipts && receipts.length === 0)) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1, transition: { delay: 0.1 } }}
				className="flex flex-col flex-1 items-center justify-center h-full"
			>
				<Typography
					color="text.secondary"
					variant="h5"
				>
					找不到與訂單號碼 {orderNumber} 相關的收款！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/receipts"
					color="inherit"
				>
					返回收款列表
				</Button>
			</motion.div>
		);
	}

	return (
		<Fragment>
			<FusePageCarded
				header={<ReceiptByOrderHeader orderNumber={orderNumber} />}
				content={
					<div className="p-4 sm:p-6 max-w-7xl space-y-6">
						{orderDetail && (
							<div className="bg-gray-50 p-4 rounded-lg shadow-sm">
								<Typography
									variant="h6"
									className="font-medium mb-1"
								>
									訂單資訊
								</Typography>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<Typography
											variant="body2"
											className="text-gray-600"
										>
											團號:
										</Typography>
										<Typography
											variant="body1"
											className="font-medium"
										>
											{orderDetail.groupCode || '無'}
										</Typography>
									</div>
									<div>
										<Typography
											variant="body2"
											className="text-gray-600"
										>
											團名:
										</Typography>
										<Typography
											variant="body1"
											className="font-medium"
										>
											{orderDetail.groupName || '無'}
										</Typography>
									</div>
								</div>
							</div>
						)}

						<ReceiptByOrderTable
							receipts={receipts}
							onEditClick={handleEditClick}
						/>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>

			<Dialog
				open={isEditDialogOpen}
				onClose={handleCloseDialog}
				fullWidth
				maxWidth="md"
			>
				<DialogTitle className="flex items-center justify-between">
					<div>編輯收款</div>
					<IconButton
						onClick={handleCloseDialog}
						size="small"
					>
						<FuseSvgIcon>heroicons-outline:x</FuseSvgIcon>
					</IconButton>
				</DialogTitle>
				<FormProvider {...methods}>
					<form onSubmit={handleSubmit(onSubmit)}>
						<ReceiptByOrderForm
							isLoading={isLoadingDetail}
							onClose={handleCloseDialog}
							isValid={isValid}
							isDirty={Object.keys(dirtyFields).length > 0}
							isCreating={isCreating}
						/>
					</form>
				</FormProvider>
			</Dialog>
		</Fragment>
	);
}
