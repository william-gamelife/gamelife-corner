import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { Table, TableHead, TableBody, TableRow, TableCell, Typography, Paper } from '@mui/material';
import { Invoice } from '@/app/(control-panel)/invoices/InvoiceApi';
import { Receipt } from '@/app/(control-panel)/receipts/ReceiptApi';
import { GroupBonusSetting } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { useUserDictionary } from '@/app/(control-panel)/users/hooks/useUserDictionary';
import { useProfitCalculation } from '../../hooks/useProfitCalculation';

interface ProfitTableProps {
	invoices: Invoice[];
	receipts: Receipt[];
	bonusSettings: GroupBonusSetting[];
}

function ProfitTable({ invoices, receipts, bonusSettings }: ProfitTableProps) {
	const methods = useFormContext();
	const { watch } = methods;
	const customerCount = watch('travellerIds')?.length || 0;

	const { users } = useUserDictionary();

	// 使用 useCallback 包裝 getUserName 函數，避免每次渲染時重新創建
	const getUserName = useCallback(
		(employeeCode: string) => {
			const user = users.find((user) => user.id === employeeCode);
			return user ? user.displayName : employeeCode;
		},
		[users]
	);

	// 使用重構後的利潤計算 hook
	const { tableRows } = useProfitCalculation({
		invoices,
		receipts,
		bonusSettings,
		customerCount,
		getUserName
	});

	return (
		<Paper className="p-6">
			<Typography
				variant="h6"
				className="mb-4"
			>
				利潤計算
			</Typography>
			<Table id="profitTable">
				<TableHead>
					<TableRow>
						<TableCell>項目</TableCell>
						<TableCell align="right">金額</TableCell>
						<TableCell>項目</TableCell>
						<TableCell align="right">金額</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{tableRows.map((row, index) => (
						<TableRow key={index}>
							<TableCell>{row.colTitle1}</TableCell>
							<TableCell align="right">{row.colValue1.toLocaleString()}</TableCell>
							<TableCell>{row.colTitle2}</TableCell>
							<TableCell align="right">{row.colValue2.toLocaleString()}</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</Paper>
	);
}

export default ProfitTable;
