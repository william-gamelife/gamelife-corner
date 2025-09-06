import React from 'react';
import {
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Button,
	Typography,
	Box,
	Chip,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Paper,
	CircularProgress,
	Alert
} from '@mui/material';
import { FastMoveOrderDetail } from '@/app/api/supabase/fast-move/types';
import { format } from 'date-fns';

interface OrderDetailDialogProps {
	open: boolean;
	onClose: () => void;
	orderData: FastMoveOrderDetail | null;
	loading: boolean;
	error: string | null;
}

// 格式化使用量 (bytes 轉換為 MB/GB)
const formatUsage = (bytes: string): string => {
	const numBytes = parseInt(bytes, 10);

	// 檢查是否為 NaN 或無效值
	if (isNaN(numBytes)) return '-';

	if (numBytes === 0) return '0 MB';

	const mb = numBytes / (1024 * 1024);

	if (mb < 1024) {
		return `${mb.toFixed(2)} MB`;
	}

	const gb = mb / 1024;
	return `${gb.toFixed(2)} GB`;
};

// 格式化時間戳
const formatTimestamp = (timestamp: string): string => {
	try {
		const numTimestamp = parseInt(timestamp, 10);

		// 檢查是否為 NaN
		if (isNaN(numTimestamp)) return '-';

		const date = new Date(numTimestamp);

		// 檢查是否為 Invalid Date
		if (isNaN(date.getTime())) return '-';

		return format(date, 'yyyy-MM-dd HH:mm:ss');
	} catch {
		return '-';
	}
};

// eSIM 狀態顯示
const getEsimStatusChip = (status: number) => {
	switch (status) {
		case 0:
			return (
				<Chip
					label="未知"
					color="default"
					size="small"
				/>
			);
		case 1:
			return (
				<Chip
					label="啟用"
					color="success"
					size="small"
				/>
			);
		case 2:
			return (
				<Chip
					label="失效"
					color="error"
					size="small"
				/>
			);
		default:
			return (
				<Chip
					label="未知"
					color="default"
					size="small"
				/>
			);
	}
};

const OrderDetailDialog: React.FC<OrderDetailDialogProps> = ({ open, onClose, orderData, loading, error }) => {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="lg"
			fullWidth
		>
			<DialogTitle>供應商訂單詳細資訊</DialogTitle>
			<DialogContent>
				{loading && (
					<Box
						display="flex"
						justifyContent="center"
						p={3}
					>
						<CircularProgress />
					</Box>
				)}

				{error && (
					<Alert
						severity="error"
						sx={{ mb: 2 }}
					>
						{error}
					</Alert>
				)}

				{orderData && !loading && !error && (
					<Box>
						{/* 基本訂單資訊 */}
						<Box mb={3}>
							<Typography
								variant="h6"
								gutterBottom
							>
								基本資訊
							</Typography>
							<Box
								display="grid"
								gridTemplateColumns="1fr 1fr"
								gap={2}
							>
								<Box>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										訂單編號
									</Typography>
									<Typography variant="body1">{orderData.orderId}</Typography>
								</Box>
								<Box>
									<Typography
										variant="body2"
										color="text.secondary"
									>
										訂購日期
									</Typography>
									<Typography variant="body1">{orderData.orderTime}</Typography>
								</Box>
							</Box>
						</Box>

						{/* 商品列表 */}
						<Typography
							variant="h6"
							gutterBottom
						>
							商品明細
						</Typography>
						<TableContainer component={Paper}>
							<Table>
								<TableHead>
									<TableRow>
										<TableCell>產品名稱</TableCell>
										<TableCell>兌換碼</TableCell>
										<TableCell>起始時間</TableCell>
										<TableCell>截止時間</TableCell>
										<TableCell>使用量</TableCell>
										<TableCell>狀態</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{orderData.itemList.map((item, index) => (
										<TableRow key={index}>
											<TableCell>
												<Typography variant="body2">{item.productName}</Typography>
											</TableCell>
											<TableCell>
												<Typography
													variant="body2"
													fontFamily="monospace"
												>
													{item.redemptionCode}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{formatTimestamp(item.usage.useSDate)}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{formatTimestamp(item.usage.useEDate)}
												</Typography>
											</TableCell>
											<TableCell>
												<Typography variant="body2">
													{formatUsage(item.usage.totalUsage)}
												</Typography>
											</TableCell>
											<TableCell>{getEsimStatusChip(item.usage.esimStatus)}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</TableContainer>
					</Box>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>關閉</Button>
			</DialogActions>
		</Dialog>
	);
};

export default OrderDetailDialog;
