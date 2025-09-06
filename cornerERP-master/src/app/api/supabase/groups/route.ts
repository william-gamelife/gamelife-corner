import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Group } from '@/app/(control-panel)/groups/GroupApi';
import { createClient } from '@/lib/supabase/server';
import GroupModel from '@/app/(control-panel)/groups/models/GroupModel';
import { requireAuth } from '@/lib/auth/middleware';
export async function GET(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	try {
		// 獲取所有查詢參數
		const url = new URL(req.url);
		const statusParams = url.searchParams.getAll('status');
		const limit = url.searchParams.get('limit');
		const groupCode = url.searchParams.get('groupCode');
		const groupName = url.searchParams.get('groupName');
		const dateFrom = url.searchParams.get('dateFrom');
		const dateTo = url.searchParams.get('dateTo');
		const excludeCompletedGroups = url.searchParams.get('excludeCompletedGroups');

		// 構建基礎查詢，使用 left join 並只獲取 type 為 1 的獎金設定
		let query = supabase.from('groups').select(
			`
			*,
			orders (
				op_id,
				sales_person,
				op_users:users_limited!orders_users_id_fk (
					display_name
				),
				sales_users:users_limited!orders_sales_person_fkey (
					display_name
				)
			)
		`
		);

		// 添加排除已結團的過濾條件
		if (excludeCompletedGroups === 'true') {
			query = query.neq('status', 1);
		}

		// 添加所有過濾條件
		if (statusParams.length > 0) {
			const statuses = statusParams.map((s) => parseInt(s));
			query = query.in('status', statuses);
		}

		if (groupCode) {
			query = query.ilike('group_code', `%${groupCode}%`);
		}

		if (groupName) {
			query = query.ilike('group_name', `%${groupName}%`);
		}

		// 修改日期篩選邏輯：只判斷出發日期
		if (dateFrom && dateTo) {
			// 起訖日都有：出發日在此區間內
			query = query.gte('departure_date', dateFrom);
			query = query.lte('departure_date', dateTo);
		} else if (dateFrom) {
			// 只有起日：出發日大於等於此日期
			query = query.gte('departure_date', dateFrom);
		} else if (dateTo) {
			// 只有迄日：出發日小於等於此日期
			query = query.lte('departure_date', dateTo);
		}

		// 添加排序和限制
		query = query.order('group_code', { ascending: false });

		if (limit) {
			query = query.limit(parseInt(limit));
		}

		// 執行查詢
		const { data, error } = await query;

		if (error) {
			console.error(error);
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// 轉換數據格式，並處理 OP 人員與業務員資訊（去除重複）
		const result = data.map((group) => ({
			...group,
			op:
				[...new Set(group.orders?.map((order) => order.op_users?.display_name).filter(Boolean))].join(', ') ||
				'',
			salesPerson:
				[...new Set(group.orders?.map((order) => order.sales_users?.display_name).filter(Boolean))].join(
					', '
				) || ''
		}));

		const groups = result.map((group) => toCamelCase<Group>(group));
		const sortedGroups = groups.sort((a, b) => {
			// First priority: Groups with status 9 come first
			if (a.status === 9 && b.status !== 9) {
				return -1; // a comes before b
			}

			if (a.status !== 9 && b.status === 9) {
				return 1; // b comes before a
			}

			// Second priority: Sort by groupCode
			return -a.groupCode.localeCompare(b.groupCode);
		});

		return NextResponse.json(sortedGroups);
	} catch (error) {
		console.error('獲取團號列表失敗:', error);
		return NextResponse.json({ error: '獲取團號列表失敗' }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const group = (await req.json()) as Group;
	const snakeCaseGroup = toSnakeCase<Group>(GroupModel(group));

	const { data, error } = await supabase.from('groups').insert(snakeCaseGroup).select().single();

	if (error) {
		console.error(error);
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json(toCamelCase<Group>(data), { status: 200 });
}

export async function DELETE(req: NextRequest) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const groupCodes = (await req.json()) as string[];

	const { error } = await supabase.from('groups').delete().in('group_code', groupCodes);

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
