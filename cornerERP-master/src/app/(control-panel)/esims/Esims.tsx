'use client';

import GlobalStyles from '@mui/material/GlobalStyles';
import EsimsHeader from './EsimsHeader';
import EsimsTable from './EsimsTable';

function Esims() {
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
				<EsimsHeader />
				<EsimsTable />
			</div>
		</>
	);
}

export default Esims;
