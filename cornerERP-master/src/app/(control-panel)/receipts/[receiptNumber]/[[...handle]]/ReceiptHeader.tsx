import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import _ from 'lodash';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { useAuth } from '@/contexts/AuthContext';
import {
	Receipt,
	useCreateReceiptMutation,
	useDeleteReceiptMutation,
	useUpdateReceiptMutation
} from '../../ReceiptApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { RECEIPT_TYPES } from '@/constants/receiptTypes';
import { useCreateLinkPayHandler } from '../../hooks/useCreateLinkPayHandler';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

function ReceiptHeader() {
	const routeParams = useParams<{ receiptNumber: string }>();
	const { receiptNumber } = routeParams;
	const isNewReceipt = receiptNumber === 'new';

	const [createReceipt] = useCreateReceiptMutation();
	const [saveReceipt] = useUpdateReceiptMutation();
	const [removeReceipt] = useDeleteReceiptMutation();
	const { handleCreateLinkPay } = useCreateLinkPayHandler();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const { orderNumber } = watch() as Receipt;

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveReceipt() {
		setIsSubmitting(true);
		try {
			await saveReceipt(getValues() as Receipt);
		} catch (error) {
			console.error('儲存收款單失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateReceipt() {
		setIsSubmitting(true);
		try {
			const values = getValues() as Receipt;
			const newReceiptNumber = await maxNumberGetDbNumber(`O${values.orderNumber}`, 2);

			const newReceipt = {
				...values,
				receiptNumber: newReceiptNumber,
				createdBy: user?.id || '',
				createdAt: new Date(),
				modifiedBy: user?.id || '',
				modifiedAt: new Date()
			} as Receipt;

			const data = await createReceipt(newReceipt).unwrap();

			if (values.receiptType === RECEIPT_TYPES.LINK_PAY) {
				await handleCreateLinkPay(newReceiptNumber, values.receiptAccount, values.email);
			}

			navigate(`/receipts/${data.receiptNumber}`);
		} catch (error) {
			console.error('新增收款單失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleRemoveReceipt() {
		removeReceipt(receiptNumber);
		navigate('/receipts');
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
						<Typography className="text-lg sm:text-2xl truncate font-semibold">
							{isNewReceipt ? '新增收款單' : orderNumber}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							收款單詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isNewReceipt && (
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="error"
						onClick={handleRemoveReceipt}
					>
						<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>
						<span className="mx-1 sm:mx-2">刪除</span>
					</Button>
				)}
				<LoadingButton
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					disabled={_.isEmpty(dirtyFields) || !isValid}
					onClick={isNewReceipt ? handleCreateReceipt : handleSaveReceipt}
					isLoading={isSubmitting}
					loadingText="處理中..."
					startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
				>
					<span className="mx-1 sm:mx-2">儲存</span>
				</LoadingButton>
			</motion.div>
		</div>
	);
}

export default ReceiptHeader;
