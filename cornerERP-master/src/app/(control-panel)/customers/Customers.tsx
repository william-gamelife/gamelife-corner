'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import CustomersHeader from './CustomersHeader';
import CustomersTable from './CustomersTable';

/**
 * The customers page.
 */
function Customers() {
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
				<CustomersHeader />
				<CustomersTable />
			</div>
		</>
	);
}

export default Customers;
