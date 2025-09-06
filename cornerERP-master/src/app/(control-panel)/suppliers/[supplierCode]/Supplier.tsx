'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from '@fuse/core/Link';
import _ from 'lodash';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import SupplierHeader from './SupplierHeader';
import SupplierModel from '../models/SupplierModels';
import { useGetSupplierQuery } from '../SupplierApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import { supplierSchema, SupplierFormData } from '../schemas/supplierSchema';
import { yupResolver } from '@hookform/resolvers/yup';

function Supplier() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ supplierCode: string }>();
	const { supplierCode } = routeParams;

	const {
		data: supplier,
		isLoading,
		isError
	} = useGetSupplierQuery(supplierCode, {
		skip: !supplierCode || supplierCode === 'new'
	});

	const methods = useForm<SupplierFormData>({
		mode: 'onChange',
		defaultValues: {
			supplierCode: '',
			supplierName: '',
			supplierType: '',
			accountCode: '',
			accountName: '',
			bankCode: '',
			isQuoted: false
		},
		resolver: yupResolver(supplierSchema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		if (supplierCode === 'new') {
			reset({
				supplierCode: '',
				supplierName: '',
				supplierType: '',
				accountCode: '',
				accountName: '',
				bankCode: '',
				isQuoted: false
			});
		}
	}, [supplierCode, reset]);

	useEffect(() => {
		if (supplier) {
			reset({
				...SupplierModel(supplier),
				supplierType: supplier.supplierType || ''
			});
		}
	}, [supplier, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && supplierCode !== 'new') {
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
					找不到此收款單！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/receipts"
					color="inherit"
				>
					返回收款單列表
				</Button>
			</motion.div>
		);
	}

	if (_.isEmpty(form)) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<SupplierHeader />}
				content={
					<div className="p-4 sm:p-6 max-w-5xl space-y-6">
						<div className="">
							<BasicInfoTab />
						</div>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
		</FormProvider>
	);
}

export default Supplier;
