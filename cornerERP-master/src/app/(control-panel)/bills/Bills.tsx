'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import BillsHeader from './BillsHeader';
import BillsTable from './BillsTable';

function Bills() {
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
				<BillsHeader />
				<BillsTable />
			</div>
		</>
	);
}

export default Bills;
