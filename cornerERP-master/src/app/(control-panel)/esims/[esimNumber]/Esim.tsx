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
import EsimHeader from './EsimHeader';
import EsimModel from '../models/EsimModels';
import { useGetEsimQuery } from '../EsimApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import { esimSchema, EsimFormData } from '../schemas/esimSchema';
import { yupResolver } from '@hookform/resolvers/yup';

function Esim() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ esimNumber: string }>();
	const { esimNumber } = routeParams;

	const {
		data: esim,
		isLoading,
		isError
	} = useGetEsimQuery(esimNumber, {
		skip: !esimNumber || esimNumber === 'new'
	});

	const methods = useForm<EsimFormData>({
		mode: 'onChange',
		defaultValues: {
			esimNumber: '',
			groupCode: '',
			orderNumber: '',
			supplierOrderNumber: '',
			status: 0,
			productRegion: '',
			wmproductId: '',
			productId: '',
			quantity: 1
		},
		resolver: yupResolver(esimSchema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		if (esimNumber === 'new') {
			reset({
				esimNumber: '',
				groupCode: '',
				orderNumber: '',
				supplierOrderNumber: '',
				status: 0,
				productRegion: '',
				wmproductId: '',
				productId: '',
				quantity: 1
			});
		}
	}, [esimNumber, reset]);

	useEffect(() => {
		if (esim) {
			reset({
				...EsimModel(esim)
			});
		}
	}, [esim, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && esimNumber !== 'new') {
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
					找不到此網卡！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/esims"
					color="inherit"
				>
					返回網卡列表
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
				header={<EsimHeader />}
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

export default Esim;
