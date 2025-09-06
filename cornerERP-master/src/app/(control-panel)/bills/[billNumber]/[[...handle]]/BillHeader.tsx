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
import { Bill, useCreateBillMutation, useDeleteBillMutation, useUpdateBillMutation } from '../../BillApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useState, useEffect, useMemo } from 'react';
import {
	useUpdateInvoiceMutation,
	useUpdateInvoiceStatusMutation,
	Invoice
} from '@/app/(control-panel)/invoices/InvoiceApi';
import { INVOICE_STATUS } from 'src/constants/invoiceStatus';
import { BILL_STATUSES, BILL_STATUS_NAMES } from '@/constants/billStatuses';
import handleCreatePDF from './BillPdf';
import LoadingButton from '@/components/common/LoadingButton';
import { format } from 'date-fns';
import { useInvoiceData } from './InvoiceContext';

function BillHeader({ activeTab }: { activeTab: number }) {
	const routeParams = useParams<{ billNumber: string }>();
	const { billNumber } = routeParams;
	const isNewBill = billNumber === 'new';

	const [createBill] = useCreateBillMutation();
	const [saveBill] = useUpdateBillMutation();
	const [removeBill] = useDeleteBillMutation();
	const [updateInvoice] = useUpdateInvoiceMutation();
	const [updateInvoiceStatus] = useUpdateInvoiceStatusMutation();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const { invoiceNumbers, billDate, status: billStatus } = watch() as Bill;

	const [initialStatus, setInitialStatus] = useState<number | null>(null);

	// 在組件初始載入時設置初始狀態
	useEffect(() => {
		if (!isNewBill && billStatus && initialStatus === null) {
			setInitialStatus(billStatus);
		}
	}, [isNewBill, billStatus, initialStatus]);
	// 根據出納單狀態決定是否允許編輯
	const isEditDisabled = !isNewBill && initialStatus === BILL_STATUSES.PAID;

	// 追蹤 invoiceNumbers 的變化
	const [originalInvoiceNumbers, setOriginalInvoiceNumbers] = useState<string[]>([]);

	// 初始化原始 invoiceNumbers
	useEffect(() => {
		if (invoiceNumbers && originalInvoiceNumbers.length === 0) {
			setOriginalInvoiceNumbers([...invoiceNumbers]);
		}
	}, [invoiceNumbers]);

	// 檢查 invoiceNumbers 是否有變化
	const isInvoiceNumbersDirty = useMemo(() => {
		if (!invoiceNumbers || !originalInvoiceNumbers) return false;

		// 長度不同，肯定有變化
		if (invoiceNumbers.length !== originalInvoiceNumbers.length) return true;

		// 檢查內容是否相同
		const sortedOriginal = [...originalInvoiceNumbers].sort();
		const sortedCurrent = [...invoiceNumbers].sort();

		return !_.isEqual(sortedOriginal, sortedCurrent);
	}, [invoiceNumbers, originalInvoiceNumbers]);

	// 判斷表單是否有變化，包括 invoiceNumbers 的變化
	const isDirty = !_.isEmpty(dirtyFields) || isInvoiceNumbersDirty;

	// 從Context獲取發票數據
	const { invoices: filteredInvoices = [] } = useInvoiceData();

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleInvoiceStatusChange = async (invoice: Invoice, isSelected: boolean) => {
		const newStatus = isSelected ? billStatus : INVOICE_STATUS.PENDING;

		// 只有當狀態需要變更時才更新
		if (invoice.status !== newStatus) {
			try {
				await updateInvoiceStatus({
					invoiceNumber: invoice.invoiceNumber,
					status: newStatus
				}).unwrap();
			} catch (error) {
				console.error('更新發票狀態失敗:', error);
			}
		}
	};

	async function handleSaveBill() {
		setIsSubmitting(true);
		try {
			// 先保存 Bill
			await saveBill(getValues() as Bill).unwrap();

			// // 獲取所有需要處理的發票（頁面上顯示的和當前選中的）
			// const allInvoicesToProcess = [...filteredInvoices];

			// // 確保所有選中的發票都在處理列表中
			// for (const invoiceNumber of invoiceNumbers) {
			// 	if (!allInvoicesToProcess.some((inv) => inv.invoiceNumber === invoiceNumber)) {
			// 		const invoice = filteredInvoices.find((inv) => inv.invoiceNumber === invoiceNumber);

			// 		if (invoice) {
			// 			allInvoicesToProcess.push(invoice);
			// 		}
			// 	}
			// }

			// 更新所有發票狀態
			// const updatePromises = allInvoicesToProcess.map((invoice) => {
			// 	// 判斷發票是否被選中
			// 	const isSelected = invoiceNumbers.includes(invoice.invoiceNumber);
			// 	return handleInvoiceStatusChange(invoice, isSelected);
			// });

			// // 等待所有更新完成
			// await Promise.all(updatePromises);

			// 更新保存後的 invoiceNumbers
			setOriginalInvoiceNumbers([...invoiceNumbers]);
		} catch (error) {
			console.error('儲存出納單失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateBill() {
		setIsSubmitting(true);
		try {
			const values = getValues() as Bill;
			const dateKey = format(new Date(), 'yyMMdd');
			const newBillNumber = await maxNumberGetDbNumber(`B${dateKey}`, 2);

			const newBill = {
				...values,
				billNumber: newBillNumber,
				createdBy: user.id,
				createdAt: new Date(),
				modifiedBy: user.id,
				modifiedAt: new Date()
			} as Bill;

			const createdBill = await createBill(newBill).unwrap();

			// 更新選中的發票狀態
			// if (values.invoiceNumbers && values.invoiceNumbers.length > 0) {
			// 	const updatePromises = values.invoiceNumbers.map((invoiceNumber) => {
			// 		const invoice = filteredInvoices.find((inv) => inv.invoiceNumber === invoiceNumber);

			// 		if (invoice) {
			// 			return handleInvoiceStatusChange(invoice, true);
			// 		}

			// 		return Promise.resolve();
			// 	});

			// 	await Promise.all(updatePromises);
			// }

			navigate(`/bills/${createdBill.billNumber}`);
		} catch (error) {
			console.error('新增出納單失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleRemoveBill() {
		removeBill(billNumber);
		navigate('/bills');
	}

	const isButtonDisabled = !isDirty || !isValid || isEditDisabled;

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
							{isNewBill ? '新增出納單' : billNumber}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							{!isNewBill && `狀態: ${BILL_STATUS_NAMES[billStatus]}`}
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isNewBill && (
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="error"
						onClick={handleRemoveBill}
						disabled={isEditDisabled}
					>
						<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>
						<span className="mx-1 sm:mx-2">刪除</span>
					</Button>
				)}
				{!isNewBill && (
					<Button
						className="whitespace-nowrap mx-4"
						variant="contained"
						color="primary"
						disabled={activeTab !== 1 || isDirty}
						onClick={() =>
							handleCreatePDF(
								billNumber,
								billDate instanceof Date ? format(billDate, 'yyyy-MM-dd') : billDate
							)
						}
						startIcon={
							<FuseSvgIcon className="hidden sm:flex">heroicons-solid:arrow-down-tray</FuseSvgIcon>
						}
					>
						匯出
					</Button>
				)}

				<LoadingButton
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					disabled={isButtonDisabled}
					onClick={isNewBill ? handleCreateBill : handleSaveBill}
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

export default BillHeader;
