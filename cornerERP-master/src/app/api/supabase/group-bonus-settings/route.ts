import { GroupBonusSetting } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import GroupBonusSettingModel from '@/app/(control-panel)/groups/models/GroupBonusSettingModel';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(req: NextRequest) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { data, error } = await supabase.from('group_bonus_setting').select('*');

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const result = data.map((setting) => toCamelCase<GroupBonusSetting>(setting));

	return NextResponse.json(result, { status: 200 });
}

export async function POST(req: NextRequest) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();

	const newSetting = (await req.json()) as GroupBonusSetting;
	const snakeCaseSetting = toSnakeCase<GroupBonusSetting>(GroupBonusSettingModel(newSetting, true));

	const { error } = await supabase.from('group_bonus_setting').insert(snakeCaseSetting);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({}, { status: 200 });
}
