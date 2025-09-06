'use client';

import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { useAuth } from '@/contexts/AuthContext';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useCreateReceiptMutation } from '../ReceiptApi';
import { useCreateLinkPayHandler } from '../hooks/useCreateLinkPayHandler';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

function BatchCreateReceiptHeader() {
	const methods = useFormContext();
	const { formState, getValues } = methods;
	const { isValid } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();
	const [createReceipt] = useCreateReceiptMutation();
	const { handleCreateLinkPay } = useCreateLinkPayHandler();
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleCreateReceipts() {
		setIsSubmitting(true);
		try {
			if (!isValid) return;

			const values = getValues();
			const { orderNumber, receiptDate, receiptType, receiptItems } = values;

			// 批量創建收款
			for (const item of receiptItems) {
				// 為每個收款生成唯一編號
				const newReceiptNumber = await maxNumberGetDbNumber(`O${orderNumber}`, 2);

				const newReceipt = {
					receiptNumber: newReceiptNumber,
					orderNumber,
					receiptDate,
					receiptType,
					receiptAccount: item.receiptAccount,
					receiptAmount: item.receiptAmount,
					note: item.note,
					email: item.email,
					payDateline: item.payDateline,
					createdBy: user?.id || '',
					createdAt: new Date(),
					modifiedBy: user?.id || '',
					modifiedAt: new Date()
				};

				await createReceipt(newReceipt).unwrap();

				// 如果是 LinkPay 類型，自動創建 LinkPay
				if (~~receiptType === RECEIPT_TYPES.LINK_PAY && item.email) {
					await handleCreateLinkPay(
						newReceiptNumber,
						item.receiptAccount,
						item.email,
						() => {},
						item.paymentName
					);
				}
			}

			// 創建完成後導航回收款列表
			navigate(`/receipts/by-order/${orderNumber}`);
		} catch (error) {
			console.error('批量創建收款失敗:', error);
			// 這裡可以添加錯誤處理邏輯，例如顯示錯誤提示
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="flex flex-col sm:flex-row flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
			<div className="flex flex-col items-start space-y-2 sm:space-y-0 w-full sm:max-w-full min-w-0">
				<motion.div
					initial={{ x: 20, opacity: 0 }}
					animate={{ x: 0, opacity: 1, transition: { delay: 0.3 } }}
				>
					<PageBreadcrumb
						className="mb-2"
						prevPage={true}
					/>
				</motion.div>

				<div className="flex items-center max-w-full space-x-3">
					<motion.div
						className="flex flex-col min-w-0"
						initial={{ x: -20 }}
						animate={{ x: 0, transition: { delay: 0.3 } }}
					>
						<Typography className="text-lg sm:text-2xl truncate font-semibold">批量新增收款</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							批量新增收款詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{/* <Button
					className="whitespace-nowrap"
					variant="text"
					onClick={() => navigate('/receipts')}
					startIcon={<FuseSvgIcon>heroicons-outline:arrow-left</FuseSvgIcon>}
				>
					返回收款列表
				</Button> */}
				<LoadingButton
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					disabled={!isValid}
					onClick={handleCreateReceipts}
					isLoading={isSubmitting}
					loadingText="處理中..."
					startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
				>
					<span className="mx-1 sm:mx-2">批量新增</span>
				</LoadingButton>
			</motion.div>
		</div>
	);
}

export default BatchCreateReceiptHeader;
