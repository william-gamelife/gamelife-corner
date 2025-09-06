'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import GroupsHeader from './GroupsHeader';
import GroupsTable from './GroupsTable';

/**
 * The groups page.
 */
function Groups() {
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
				<GroupsHeader />
				<GroupsTable />
			</div>
		</>
	);
}

export default Groups;
