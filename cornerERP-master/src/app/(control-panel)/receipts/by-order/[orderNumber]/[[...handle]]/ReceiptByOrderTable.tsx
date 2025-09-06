import React, { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import Chip from '@mui/material/Chip';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Tooltip from '@mui/material/Tooltip';
import Link from '@fuse/core/Link';
import { Receipt } from '../../../ReceiptApi';
import { getReceiptTypeName } from 'src/constants/receiptTypes';
import { getReceiptStatusName, getReceiptStatusColor } from 'src/constants/receiptStatus';
import { RECEIPT_TYPES } from 'src/constants/receiptTypes';
import LinkPayExpandableRow from '../../../LinkPayExpandableRow';
import { format } from 'date-fns';

type ReceiptByOrderTableProps = {
	receipts: Receipt[];
	onEditClick: (receiptNumber: string) => void;
};

function ReceiptByOrderTable({ receipts, onEditClick }: ReceiptByOrderTableProps) {
	const [openRows, setOpenRows] = useState<Record<string, boolean>>({});
	const [refreshKey, setRefreshKey] = useState(0);

	const handleToggleRow = (receiptNumber: string) => {
		setOpenRows((prev) => ({
			...prev,
			[receiptNumber]: !prev[receiptNumber]
		}));
	};

	// 處理 LinkPay 創建成功後的回調
	const handleLinkPayCreated = () => {
		// 強制重新獲取數據
		setRefreshKey((prev) => prev + 1);
		// 這裡可以添加其他邏輯，例如重新獲取收據數據
	};

	return (
		<TableContainer
			component={Paper}
			className="shadow-none border rounded-lg"
		>
			<Table>
				<TableHead className="bg-gray-50">
					<TableRow>
						<TableCell className="font-medium">收款單號</TableCell>
						<TableCell className="font-medium">收款日期</TableCell>
						<TableCell className="font-medium">收款方式</TableCell>
						<TableCell className="font-medium">收款金額</TableCell>
						<TableCell className="font-medium">實際金額</TableCell>
						<TableCell className="font-medium">狀態</TableCell>
						<TableCell className="font-medium">操作</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{receipts?.map((receipt) => (
						<React.Fragment key={receipt.receiptNumber}>
							<TableRow hover>
								<TableCell>
									<Link href={`/receipts/${receipt.receiptNumber}`}>{receipt.receiptNumber}</Link>
								</TableCell>
								<TableCell>{format(new Date(receipt.receiptDate), 'yyyy-MM-dd')}</TableCell>
								<TableCell>{getReceiptTypeName(receipt.receiptType)}</TableCell>
								<TableCell>{receipt.receiptAmount}</TableCell>
								<TableCell>{receipt.actualAmount}</TableCell>
								<TableCell>
									<Chip
										label={getReceiptStatusName(receipt.status)}
										color={getReceiptStatusColor(receipt.status)}
										size="small"
									/>
								</TableCell>
								<TableCell>
									<div className="flex items-center space-x-1">
										<IconButton
											color="primary"
											onClick={() => onEditClick(receipt.receiptNumber)}
											size="small"
										>
											<EditIcon />
										</IconButton>

										{receipt.receiptType === RECEIPT_TYPES.LINK_PAY &&
											receipt.linkpay &&
											receipt.linkpay.length > 0 && (
												<Tooltip title="查看 LinkPay 資訊">
													<IconButton
														color="info"
														onClick={() => handleToggleRow(receipt.receiptNumber)}
														size="small"
													>
														{openRows[receipt.receiptNumber] ? (
															<KeyboardArrowUpIcon />
														) : (
															<KeyboardArrowDownIcon />
														)}
													</IconButton>
												</Tooltip>
											)}
									</div>
								</TableCell>
							</TableRow>
							{receipt.receiptType === RECEIPT_TYPES.LINK_PAY && (
								<LinkPayExpandableRow
									receipt={receipt}
									linkpayData={receipt.linkpay || []}
									open={!!openRows[receipt.receiptNumber]}
									onToggle={() => handleToggleRow(receipt.receiptNumber)}
									onLinkPayCreated={handleLinkPayCreated}
								/>
							)}
						</React.Fragment>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}

export default ReceiptByOrderTable;
