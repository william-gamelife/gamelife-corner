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
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useState } from 'react';
import SupplierDialog from '@/app/(control-panel)/suppliers/components/SupplierDialog';
import {
	Invoice,
	useCreateInvoiceMutation,
	useDeleteInvoiceMutation,
	useUpdateInvoiceMutation
} from '../../InvoiceApi';
import { INVOICE_STATUS } from '@/constants/invoiceStatus';
import { useGetSuppliersQuery } from 'src/app/(control-panel)/suppliers/SupplierApi';
import LoadingButton from '@/components/common/LoadingButton';

function InvoiceHeader() {
	const routeParams = useParams<{ invoiceNumber: string }>();
	const { invoiceNumber } = routeParams;
	const isNewInvoice = invoiceNumber === 'new';

	const [createInvoice] = useCreateInvoiceMutation();
	const [saveInvoice] = useUpdateInvoiceMutation();
	const [removeInvoice] = useDeleteInvoiceMutation();
	const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
	const { refetch: refetchSuppliers } = useGetSuppliersQuery({});

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const { orderNumber, invoiceItems } = watch() as Invoice;
	const [isItemsDirty, setIsItemsDirty] = useState(false);

	// 新增：獲取發票狀態
	const status = watch('status');
	// 檢查發票是否為已出帳狀態
	const isInvoiceBilled = status === 2; // 或使用 INVOICE_STATUS.BILLED

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleCreateInvoice() {
		setIsSubmitting(true);
		const values = getValues() as Invoice;

		const newInvoiceNumber = await maxNumberGetDbNumber(`I${values.groupCode}`, 2);

		const newInvoice = {
			groupCode: values.groupCode,
			orderNumber: values.orderNumber,
			invoiceDate: values.invoiceDate,
			invoiceNumber: newInvoiceNumber,
			invoiceItems: values.invoiceItems,
			status: INVOICE_STATUS.PENDING,
			createdBy: user?.id || '',
			createdAt: new Date(),
			modifiedBy: user?.id || '',
			modifiedAt: new Date()
		} as Invoice;

		createInvoice(newInvoice)
			.unwrap()
			.then(() => {
				navigate(`/invoices/${newInvoiceNumber}`);
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	}

	async function handleSaveInvoice() {
		setIsSubmitting(true);
		try {
			await saveInvoice(getValues() as Invoice);
		} catch (error) {
			console.error('儲存發票失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateAndAddNew() {
		setIsSubmitting(true);
		const values = getValues() as Invoice;

		const newInvoiceNumber = await maxNumberGetDbNumber(`I${values.groupCode}`, 2);

		const newInvoice = {
			groupCode: values.groupCode,
			orderNumber: values.orderNumber,
			invoiceDate: values.invoiceDate,
			invoiceNumber: newInvoiceNumber,
			invoiceItems: values.invoiceItems,
			status: INVOICE_STATUS.PENDING,
			createdBy: user?.id || '',
			createdAt: new Date(),
			modifiedBy: user?.id || '',
			modifiedAt: new Date()
		} as Invoice;

		createInvoice(newInvoice)
			.unwrap()
			.then(() => {
				// 重新載入頁面以清空表單並保持在新增模式
				window.location.reload();
			})
			.finally(() => {
				setIsSubmitting(false);
			});
	}

	function handleRemoveInvoice() {
		removeInvoice(invoiceNumber);
		navigate('/invoices');
	}

	function handleOpenSupplierDialog() {
		setIsSupplierDialogOpen(true);
	}

	function handleCloseSupplierDialog() {
		setIsSupplierDialogOpen(false);
	}

	function handleSupplierSave() {
		refetchSuppliers();
		handleCloseSupplierDialog();
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
							{isNewInvoice ? '新增請款單' : invoiceNumber}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							請款單詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isInvoiceBilled && (
					<Button
						className="whitespace-nowrap"
						variant="outlined"
						color="primary"
						onClick={handleOpenSupplierDialog}
					>
						<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>
						<span className="mx-1 sm:mx-2">新增供應商</span>
					</Button>
				)}
				{isNewInvoice && (
					<>
						<LoadingButton
							className="whitespace-nowrap"
							variant="contained"
							color="secondary"
							onClick={handleCreateInvoice}
							disabled={_.isEmpty(dirtyFields) || !isValid}
							isLoading={isSubmitting}
							loadingText="新增中..."
							startIcon={<FuseSvgIcon>heroicons-outline:plus</FuseSvgIcon>}
						>
							<span className="mx-1 sm:mx-2">新增</span>
						</LoadingButton>
						<LoadingButton
							className="whitespace-nowrap"
							variant="outlined"
							color="secondary"
							onClick={handleCreateAndAddNew}
							disabled={_.isEmpty(dirtyFields) || !isValid}
							isLoading={isSubmitting}
							loadingText="處理中..."
							startIcon={<FuseSvgIcon>heroicons-outline:document-plus</FuseSvgIcon>}
						>
							<span className="mx-1 sm:mx-2">新增後繼續</span>
						</LoadingButton>
					</>
				)}
				{!isNewInvoice && (
					<>
						<LoadingButton
							className="whitespace-nowrap"
							variant="contained"
							color="secondary"
							onClick={handleSaveInvoice}
							disabled={_.isEmpty(dirtyFields) || !isValid || isInvoiceBilled}
							isLoading={isSubmitting}
							loadingText="處理中..."
							startIcon={<FuseSvgIcon>heroicons-outline:check</FuseSvgIcon>}
						>
							<span className="mx-1 sm:mx-2">儲存</span>
						</LoadingButton>
						<Button
							className="whitespace-nowrap"
							variant="contained"
							color="error"
							onClick={handleRemoveInvoice}
							disabled={isInvoiceBilled}
						>
							<FuseSvgIcon className="hidden sm:flex">heroicons-outline:trash</FuseSvgIcon>
							<span className="mx-1 sm:mx-2">刪除</span>
						</Button>
					</>
				)}
			</motion.div>

			<SupplierDialog
				open={isSupplierDialogOpen}
				onClose={handleCloseSupplierDialog}
				onSave={handleSupplierSave}
			/>
		</div>
	);
}

export default InvoiceHeader;
