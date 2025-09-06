'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import OrdersHeader from './OrdersHeader';
import OrdersTable from './OrdersTable';

function Orders() {
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
				<OrdersHeader />
				<OrdersTable />
			</div>
		</>
	);
}

export default Orders;
