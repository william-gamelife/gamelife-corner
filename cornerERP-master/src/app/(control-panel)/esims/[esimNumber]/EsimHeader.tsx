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
import { Esim, useCreateEsimMutation, useDeleteEsimMutation, useUpdateEsimMutation } from '../EsimApi';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';
import { maxNumberGetDbNumber } from '@/@max-numbers/maxNumberApi';
import {
	useCreateFastMoveOrderMutation,
	useGetFastMoveProductsQuery
} from 'src/app/api/supabase/fast-move/FastMoveApi';

function EsimHeader() {
	const routeParams = useParams<{ esimNumber: string }>();
	const { esimNumber } = routeParams;
	const isNewEsim = esimNumber === 'new';

	const [createEsim] = useCreateEsimMutation();
	const [saveEsim] = useUpdateEsimMutation();
	const [removeEsim] = useDeleteEsimMutation();
	const [createFastMoveOrder] = useCreateFastMoveOrderMutation();

	// 取得 FastMove 產品資料以獲取價格
	const { data: fastMoveData } = useGetFastMoveProductsQuery();

	const methods = useFormContext();
	const { formState, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();
	const { session, user } = useAuth();

	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveEsim() {
		setIsSubmitting(true);
		try {
			await saveEsim(getValues() as Esim);
		} catch (error) {
			console.error('儲存網卡失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateEsim() {
		setIsSubmitting(true);
		try {
			const values = getValues() as Esim;
			const newEsimNumber = await maxNumberGetDbNumber(`E${values.groupCode}`, 2);
			const newEsim = {
				...values,
				esimNumber: newEsimNumber,
				createdBy: user?.id || '',
				createdAt: new Date(),
				modifiedBy: user?.id || '',
				modifiedAt: new Date()
			} as Esim;

			const data = await createEsim(newEsim).unwrap();

			if (data.esimNumber) {
				// 從 FastMove 產品資料中獲取價格
				const selectedProduct =
					fastMoveData?.success && fastMoveData.data?.prodList
						? fastMoveData.data.prodList.find((product) => product.wmproductId === data.productId)
						: null;

				const productPrice = selectedProduct ? selectedProduct.productPrice : 0;

				const invoiceNumber = await maxNumberGetDbNumber(`I${values.groupCode}`, 2);
				// 調用 FastMove POST API
				try {
					await createFastMoveOrder({
						email: data.email,
						productId: data.productId,
						quantity: data.quantity,
						price: productPrice,
						groupCode: data.groupCode,
						orderNumber: data.orderNumber,
						createdBy: data.createdBy,
						invoiceNumber: invoiceNumber,
						esimNumber: data.esimNumber
					}).unwrap();
				} catch (fastMoveError) {
					console.error('FastMove API 調用錯誤:', fastMoveError);
				}
			}

			navigate(`/esims/${data.esimNumber}`);
		} catch (error) {
			console.error('新增網卡失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleRemoveEsim() {
		removeEsim(esimNumber);
		navigate('/esims');
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
							{isNewEsim ? '新增網卡' : esimNumber}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							網卡詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isNewEsim && (
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="error"
						onClick={handleRemoveEsim}
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
					onClick={isNewEsim ? handleCreateEsim : handleSaveEsim}
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

export default EsimHeader;
