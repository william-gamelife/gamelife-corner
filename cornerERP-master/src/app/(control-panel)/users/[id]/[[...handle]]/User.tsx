'use client';

import FuseLoading from '@fuse/core/FuseLoading';
import FusePageCarded from '@fuse/core/FusePageCarded';
import { useParams } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FuseTabs from 'src/components/tabs/FuseTabs';
import FuseTab from 'src/components/tabs/FuseTab';
import UserHeader from './UserHeader';
import UserModel from '../../models/UserModel';
import { useGetUserQuery } from '../../UserApi';
import BasicInfoTab from './tabs/BasicInfoTab';
import { SyntheticEvent, useEffect, useState } from 'react';

const schema = (isNewUser: boolean) =>
	z.object({
		id: z.string().min(4, '員工編號必須是4碼').max(4, '員工編號必須是4碼'),
		displayName: z.string().min(1, '顯示名稱不能為空').max(25, '顯示名稱不能超過25字'),
		title: z.string().max(25, '職稱不能超過25字').optional(),
		startOfDuty: z.union([z.string(), z.number(), z.date()]).optional(),
		endOfDuty: z.union([z.string(), z.null(), z.date()]).optional(),
		password: isNewUser
			? z.string().min(8, '密碼不能少於8碼').max(128, '密碼不能超過128字')
			: z.union([
					z.string().optional().nullable(),
					z.string().min(8, '密碼不能少於8碼').max(128, '密碼不能超過128字')
				]),
		roles: z.array(z.string()).optional(),
		photoUrl: z.union([z.string(), z.null()]).optional()
	});

function User() {
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));
	const routeParams = useParams<{ id: string }>();
	const { id } = routeParams;
	const isNewUser = id === 'new';

	const { data: user, isLoading } = useGetUserQuery(id, {
		skip: isNewUser
	});

	const methods = useForm({
		mode: 'onChange',
		defaultValues: UserModel({}),
		resolver: zodResolver(schema(isNewUser))
	});

	const [tabValue, setTabValue] = useState('basic-info');

	function handleTabChange(event: SyntheticEvent, value: string) {
		setTabValue(value);
	}

	useEffect(() => {
		if (user) {
			methods.reset(user);
		}
	}, [user, methods]);

	if (isLoading) {
		return <FuseLoading />;
	}

	return (
		<FormProvider {...methods}>
			<FusePageCarded
				header={<UserHeader />}
				content={
					<div className="p-4 sm:p-6 max-w-5xl space-y-6">
						<FuseTabs
							value={tabValue}
							onChange={handleTabChange}
						>
							<FuseTab
								value="basic-info"
								label="基本資料"
							/>
						</FuseTabs>
						<div className="">
							<div className={tabValue !== 'basic-info' ? 'hidden' : ''}>
								<BasicInfoTab />
							</div>
						</div>
					</div>
				}
				scroll={isMobile ? 'normal' : 'content'}
			/>
		</FormProvider>
	);
}

export default User;
