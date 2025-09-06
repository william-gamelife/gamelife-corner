'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import ReceiptsHeader from './ReceiptsHeader';
import ReceiptsTable from './ReceiptsTable';

function Receipts() {
	return (
		<>
			<GlobalStyles
				styles={() => ({
					'#root': {
						maxHeight: '100vh'
					}
				})}
			/>
			<div className="w-full h-[calc(100vh-65px)] flex flex-col px-4 pb-4">
				<ReceiptsHeader />
				<ReceiptsTable />
			</div>
		</>
	);
}

export default Receipts;
