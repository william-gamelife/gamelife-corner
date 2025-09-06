import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@fuse/core/Link';
import { motion } from 'motion/react';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import PageBreadcrumb from 'src/components/PageBreadcrumb';

type ReceiptByOrderHeaderProps = {
	orderNumber: string;
};

function ReceiptByOrderHeader({ orderNumber }: ReceiptByOrderHeaderProps) {
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
							訂單 {orderNumber} 的收款清單
						</Typography>
						<Typography
							variant="caption"
							className="font-medium"
						>
							收款清單詳情
						</Typography>
					</motion.div>
				</div>
			</div>
			<motion.div
				className="flex items-center gap-2"
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0, transition: { delay: 0.3 } }}
			>
				<Button
					className="whitespace-nowrap"
					variant="contained"
					color="secondary"
					component={Link}
					to="/receipts"
				>
					<FuseSvgIcon>heroicons-outline:arrow-left</FuseSvgIcon>
					<span className="mx-1 sm:mx-2">返回列表</span>
				</Button>
			</motion.div>
		</div>
	);
}

export default ReceiptByOrderHeader;
