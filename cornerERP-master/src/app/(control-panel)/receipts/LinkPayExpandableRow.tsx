import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Collapse from '@mui/material/Collapse';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { getLinkPayStatusName, getLinkPayStatusColor, LINKPAY_STATUS } from '@/constants/linkPayStatus';
import { LinkPayLog, Receipt } from './ReceiptApi';
import { useSnackbar } from 'notistack';
import { useCreateLinkPayHandler } from './hooks/useCreateLinkPayHandler';

interface LinkPayExpandableRowProps {
	receipt: Receipt;
	linkpayData: LinkPayLog[];
	paymentName: string;
	open: boolean;
	onToggle: () => void;
	onLinkPayCreated?: () => void; // 可選的回調函數，用於通知父組件 LinkPay 已創建
}

function LinkPayExpandableRow({
	receipt,
	linkpayData,
	paymentName,
	open,
	onToggle,
	onLinkPayCreated
}: LinkPayExpandableRowProps) {
	const { enqueueSnackbar } = useSnackbar();
	const { handleCreateLinkPay, isCreating } = useCreateLinkPayHandler();

	const handleCopyLink = (link: string) => {
		navigator.clipboard.writeText(link);
		enqueueSnackbar('連結已複製到剪貼簿', { variant: 'success' });
	};

	// 檢查是否有待付款或已付款的 LinkPay
	const hasPendingOrPaidLinkPay = linkpayData.some(
		(item) => item.status === LINKPAY_STATUS.PENDING || item.status === LINKPAY_STATUS.PAID
	);

	// 檢查是否可以新增 LinkPay
	const canCreateLinkPay = !hasPendingOrPaidLinkPay && receipt.status === 0; // 假設 0 是待付款狀態

	// 處理新增 LinkPay
	const handleCreateClick = async () => {
		await handleCreateLinkPay(
			receipt.receiptNumber,
			receipt.receiptAccount,
			receipt.email,
			onLinkPayCreated,
			paymentName
		);
	};

	return (
		<TableRow>
			<TableCell
				style={{ paddingBottom: 0, paddingTop: 0 }}
				colSpan={8}
			>
				<Collapse
					in={open}
					timeout="auto"
					unmountOnExit
				>
					<Box sx={{ margin: 2 }}>
						<div className="flex justify-between items-center mb-3">
							<Typography
								variant="subtitle2"
								component="div"
								className="font-medium"
							>
								LinkPay 付款資訊
							</Typography>

							{canCreateLinkPay && (
								<Button
									variant="contained"
									color="primary"
									size="small"
									startIcon={<AddIcon />}
									onClick={handleCreateClick}
									disabled={isCreating}
								>
									{isCreating ? '處理中...' : '新增 LinkPay'}
								</Button>
							)}
						</div>

						{linkpayData.length > 0 ? (
							<Table
								size="small"
								className="border rounded-lg"
							>
								<TableHead className="bg-gray-50">
									<TableRow>
										<TableCell className="font-medium">LinkPay 訂單編號</TableCell>
										<TableCell className="font-medium">付款金額</TableCell>
										<TableCell className="font-medium">付款截止日</TableCell>
										<TableCell className="font-medium">付款連結</TableCell>
										<TableCell className="font-medium">付款名稱</TableCell>
										<TableCell className="font-medium">狀態</TableCell>
										<TableCell className="font-medium">建立時間</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{linkpayData.map((item) => (
										<TableRow key={item.linkpayOrderNumber}>
											<TableCell>{item.linkpayOrderNumber}</TableCell>
											<TableCell>{item.price}</TableCell>
											<TableCell>
												{item.endDate ? format(new Date(item.endDate), 'yyyy-MM-dd') : '-'}
											</TableCell>
											<TableCell>
												<div className="flex items-center">
													<Typography
														className="max-w-xs truncate"
														title={item.link}
													>
														{item.link ? item.link.substring(0, 20) + '...' : '-'}
													</Typography>
													{item.link && (
														<Tooltip title="複製連結">
															<IconButton
																size="small"
																onClick={() => handleCopyLink(item.link)}
																className="ml-2"
															>
																<ContentCopyIcon fontSize="small" />
															</IconButton>
														</Tooltip>
													)}
												</div>
											</TableCell>
											<TableCell>{item.paymentName}</TableCell>
											<TableCell>
												<Chip
													label={getLinkPayStatusName(item.status)}
													color={getLinkPayStatusColor(item.status)}
													size="small"
												/>
											</TableCell>
											<TableCell>
												{item.createdAt
													? format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')
													: '-'}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						) : (
							<div className="text-center p-4 bg-gray-50 border rounded-lg">
								<Typography color="textSecondary">
									{canCreateLinkPay
										? '目前沒有 LinkPay 資訊，請點擊上方按鈕新增'
										: '目前沒有 LinkPay 資訊'}
								</Typography>
							</div>
						)}
					</Box>
				</Collapse>
			</TableCell>
		</TableRow>
	);
}

export default LinkPayExpandableRow;
