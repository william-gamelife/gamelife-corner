import { combineSlices } from '@reduxjs/toolkit';
import apiService from './apiService';
import { navigationSlice } from '@/components/theme-layouts/components/navigation/store/navigationSlice';
import { userDictionarySlice } from '../app/(control-panel)/users/store/userDictionarySlice';
import { CalendarApi } from '../app/(control-panel)/calendar/CalendarApi';

export interface LazyLoadedSlices {}

// `combineSlices` automatically combines the reducers using
// their `reducerPath`s, therefore we no longer need to call `combineReducers`.
export const rootReducer = combineSlices(
	/**
	 * Static slices
	 */
	navigationSlice,
	/**
	 * Lazy loaded slices
	 */
	{
		[apiService.reducerPath]: apiService.reducer,
		[userDictionarySlice.reducerPath]: userDictionarySlice.reducer,
		[CalendarApi.reducerPath]: CalendarApi.reducer
	}
).withLazyLoadedSlices<LazyLoadedSlices>();

export default rootReducer;
