import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import useThemeMediaQuery from '@fuse/hooks/useThemeMediaQuery';
import PageBreadcrumb from 'src/components/PageBreadcrumb';
import FuseUtils from '@fuse/utils/FuseUtils';
import authRoles from '@auth/authRoles';
import useUser from '@auth/useUser';

function UsersHeader() {
	const { data } = useUser();
	const userRole = data?.roles;
	const isMobile = useThemeMediaQuery((theme) => theme.breakpoints.down('lg'));

	return (
		<div className="flex grow-0 flex-1 w-full items-center justify-between space-y-2 sm:space-y-0 py-6 sm:py-8">
			<motion.span
				initial={{ x: -20 }}
				animate={{ x: 0, transition: { delay: 0.2 } }}
			>
				<div>
					<PageBreadcrumb className="mb-2" />
					<Typography className="text-4xl font-extrabold leading-none tracking-tight">使用者管理</Typography>
				</div>
			</motion.span>

			<div className="flex flex-1 items-center justify-end space-x-2">
				<motion.div
					className="flex grow-0"
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0, transition: { delay: 0.2 } }}
				>
					{Boolean(FuseUtils.hasPermission(authRoles.admin, userRole)) && (
						<Button
							className=""
							variant="contained"
							color="secondary"
							component={NavLinkAdapter}
							to="/users/new"
							size={isMobile ? 'small' : 'medium'}
						>
							<FuseSvgIcon size={20}>heroicons-outline:plus</FuseSvgIcon>
							<span className="mx-1 sm:mx-2">新增</span>
						</Button>
					)}
				</motion.div>
			</div>
		</div>
	);
}

export default UsersHeader;
