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
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import InvoiceHeader from './InvoiceHeader';
import InvoiceModel from '../../models/InvoiceModel';
import { useGetInvoiceQuery } from '../../InvoiceApi';
import BasicInfoTab from './tabs/BasicInfoTab';

/**
 * Form Validation Schema
 */
const schema = z.object({
	groupCode: z.string().min(1, '團號不能為空'),
	invoiceDate: z.union([z.string(), z.date()])
});

function Invoice() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ invoiceNumber: string }>();
	const { invoiceNumber } = routeParams;
	const isNewInvoice = invoiceNumber === 'new';

	const {
		data: invoice,
		isLoading,
		isError
	} = useGetInvoiceQuery(invoiceNumber, {
		skip: !invoiceNumber || invoiceNumber === 'new'
	});

	const methods = useForm({
		mode: 'onChange',
		defaultValues: {},
		resolver: zodResolver(schema)
	});

	const { reset, watch } = methods;
	const form = watch();

	useEffect(() => {
		if (invoiceNumber === 'new') {
			reset(InvoiceModel({}));
		}
	}, [invoiceNumber, reset]);

	useEffect(() => {
		if (invoice) {
			reset({ ...invoice, invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate) : null });
		}
	}, [invoice, reset]);

	if (isLoading) {
		return <FuseLoading />;
	}

	if (isError && invoiceNumber !== 'new') {
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
					找不到此請款單！
				</Typography>
				<Button
					className="mt-6"
					component={Link}
					variant="outlined"
					to="/invoices"
					color="inherit"
				>
					返回請款單列表
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
				header={<InvoiceHeader />}
				content={
					<div className="p-4 sm:p-6 space-y-6">
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

export default Invoice;
