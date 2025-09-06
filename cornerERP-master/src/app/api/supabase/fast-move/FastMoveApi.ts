import { apiService as api } from '@/store/apiService';
import {
	FastMoveApiResult,
	FastMoveOrderRequest,
	FastMoveOrderResponse,
	FastMoveOrderDetailRequest,
	FastMoveOrderDetailResponse
} from './types';

export const addTagTypes = ['FastMove'] as const;

const FastMoveApi = api
	.enhanceEndpoints({
		addTagTypes
	})
	.injectEndpoints({
		endpoints: (builder) => ({
			getFastMoveProducts: builder.query<FastMoveApiResult, { forceRefresh?: boolean }>({
				query: (params = {}) => ({
					url: '/api/supabase/fast-move',
					params: params.forceRefresh ? { forceRefresh: params.forceRefresh } : undefined
				}),
				providesTags: ['FastMove']
			}),
			createFastMoveOrder: builder.mutation<FastMoveOrderResponse, FastMoveOrderRequest>({
				query: (orderData) => ({
					url: '/api/supabase/fast-move',
					method: 'POST',
					body: orderData
				})
			}),
			queryFastMoveOrderDetail: builder.mutation<FastMoveOrderDetailResponse, FastMoveOrderDetailRequest>({
				query: (params) => ({
					url: '/api/supabase/fast-move/order-detail',
					method: 'POST',
					body: params
				})
			})
		}),
		overrideExisting: false
	});

export default FastMoveApi;

export const {
	useGetFastMoveProductsQuery,
	useLazyGetFastMoveProductsQuery,
	useCreateFastMoveOrderMutation,
	useQueryFastMoveOrderDetailMutation
} = FastMoveApi;
