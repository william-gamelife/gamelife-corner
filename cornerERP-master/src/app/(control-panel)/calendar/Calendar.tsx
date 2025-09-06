'use client';

import FusePageCarded from '@fuse/core/FusePageCarded';
import CalendarHeader from './CalendarHeader';
import CalendarView from './CalendarView';

export default function Calendar() {
	return (
		<FusePageCarded
			header={<CalendarHeader />}
			content={<CalendarView />}
		/>
	);
}
