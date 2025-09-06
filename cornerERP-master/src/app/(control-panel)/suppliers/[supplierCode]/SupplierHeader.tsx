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
	Supplier,
	useCreateSupplierMutation,
	useDeleteSupplierMutation,
	useUpdateSupplierMutation
} from '../SupplierApi';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';

function SupplierHeader() {
	const routeParams = useParams<{ supplierCode: string }>();
	const { supplierCode } = routeParams;
	const isNewSupplier = supplierCode === 'new';

	const [createSupplier] = useCreateSupplierMutation();
	const [saveSupplier] = useUpdateSupplierMutation();
	const [removeSupplier] = useDeleteSupplierMutation();

	const methods = useFormContext();
	const { formState, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveSupplier() {
		setIsSubmitting(true);
		try {
			await saveSupplier(getValues() as Supplier);
		} catch (error) {
			console.error('儲存供應商失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateSupplier() {
		setIsSubmitting(true);
		try {
			const values = getValues() as Supplier;
			// 根據供應商類型生成供應商編號
			// 例如：B2B0002，數字至少四碼
			const maxNumber = await maxNumberGetDbNumber(values.supplierType, 4);
			const newSupplier = {
				...values,
				supplierCode: maxNumber,
				createdBy: user?.id || '',
				createdAt: new Date(),
				modifiedBy: user?.id || '',
				modifiedAt: new Date()
			} as Supplier;

			const data = await createSupplier(newSupplier).unwrap();

			navigate(`/suppliers/${data.supplierCode}`);
		} catch (error) {
			console.error('新增供應商失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleRemoveSupplier() {
		removeSupplier(supplierCode);
		navigate('/suppliers');
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
							{isNewSupplier ? '新增供應商' : supplierCode}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							供應商詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isNewSupplier && (
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="error"
						onClick={handleRemoveSupplier}
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
					onClick={isNewSupplier ? handleCreateSupplier : handleSaveSupplier}
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

export default SupplierHeader;
