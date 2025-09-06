'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import InvoicesHeader from './InvoicesHeader';
import InvoicesTable from './InvoicesTable';

function Invoices() {
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
				<InvoicesHeader />
				<InvoicesTable />
			</div>
		</>
	);
}

export default Invoices;
