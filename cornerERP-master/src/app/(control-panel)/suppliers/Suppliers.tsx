'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import SuppliersHeader from './SuppliersHeader';
import SuppliersTable from './SuppliersTable';

function Suppliers() {
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
				<SuppliersHeader />
				<SuppliersTable />
			</div>
		</>
	);
}

export default Suppliers;
