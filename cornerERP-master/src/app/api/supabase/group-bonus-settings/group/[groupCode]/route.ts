import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { GroupBonusSetting } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { toCamelCase } from '@/utils/tools';
import { BONUS_SETTING_TYPE_SORT_ORDER } from '@/constants/bonusSettingTypes';
import { requireAuth } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { groupCode } = params;

	const { data, error } = await supabase.from('group_bonus_setting').select('*').eq('group_code', groupCode);

	const sortedData = data.sort((a, b) => {
		return (BONUS_SETTING_TYPE_SORT_ORDER[a.type] || 0) - (BONUS_SETTING_TYPE_SORT_ORDER[b.type] || 0);
	});

	const result = sortedData.map((setting) => toCamelCase<GroupBonusSetting>(setting));

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(result, { status: 200 });
}
