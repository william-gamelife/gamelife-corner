import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import { useFormContext } from 'react-hook-form';
import { useParams } from 'next/navigation';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import useNavigate from '@fuse/hooks/useNavigate';
import { useCreateUserMutation, useUpdateUserMutation, useDeleteUserMutation } from '../../UserApi';
import { User } from '@auth/user';
import _ from 'lodash';
import { useState } from 'react';
import LoadingButton from '@/components/common/LoadingButton';
import authRoles from '@auth/authRoles';
import FuseUtils from '@fuse/utils';
import useUser from '@auth/useUser';

function UserHeader() {
	const routeParams = useParams<{ id: string }>();
	const { id } = routeParams;
	const isNewUser = id === 'new';
	const { data: user } = useUser();
	const userRole = user?.roles;
	const [createUser] = useCreateUserMutation();
	const [saveUser] = useUpdateUserMutation();
	const [removeUser] = useDeleteUserMutation();

	const methods = useFormContext();
	const { formState, watch, getValues } = methods;
	const { isValid, dirtyFields } = formState;

	const navigate = useNavigate();

	const { displayName } = watch() as User;
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSaveUser() {
		setIsSubmitting(true);
		try {
			await saveUser(getValues());
		} catch (error) {
			console.error('儲存使用者失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleCreateUser() {
		setIsSubmitting(true);
		try {
			await createUser(getValues());
		} catch (error) {
			console.error('新增使用者失敗:', error);
		} finally {
			setIsSubmitting(false);
		}
	}

	function handleRemoveUser() {
		removeUser(id);
		navigate('/users');
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
							{isNewUser ? '新增使用者' : displayName}
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							使用者資料
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				{!isNewUser && Boolean(FuseUtils.hasPermission(authRoles.admin, userRole)) && (
					<Button
						className="whitespace-nowrap"
						variant="contained"
						color="error"
						onClick={handleRemoveUser}
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
					onClick={isNewUser ? handleCreateUser : handleSaveUser}
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

export default UserHeader;
