'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import UsersHeader from './UsersHeader';
import UsersTable from './UsersTable';

function Users() {
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
				<UsersHeader />
				<UsersTable />
			</div>
		</>
	);
}

export default Users;
