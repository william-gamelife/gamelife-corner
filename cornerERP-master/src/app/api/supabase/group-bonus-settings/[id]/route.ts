import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { GroupBonusSetting } from '@/app/(control-panel)/groups/GroupBonusSettingApi';
import GroupBonusSettingModel from '@/app/(control-panel)/groups/models/GroupBonusSettingModel';
import { requireAdmin } from '@/lib/auth/middleware';

export async function GET(req: NextRequest, props: { params: { id: string } }) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { id } = params;

	const { data, error } = await supabase.from('group_bonus_setting').select('*').eq('id', id).single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase<GroupBonusSetting>(data), { status: 200 });
}

export async function PUT(req: NextRequest, props: { params: { id: string } }) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { id } = params;
	const updatedSetting = await req.json();
	const snakeCaseSetting = toSnakeCase<GroupBonusSetting>(GroupBonusSettingModel(updatedSetting));

	const { data, error } = await supabase
		.from('group_bonus_setting')
		.update(snakeCaseSetting)
		.eq('id', id)
		.select()
		.single();

	if (error) {
		console.error(error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(toCamelCase<GroupBonusSetting>(data), { status: 200 });
}

export async function DELETE(req: NextRequest, props: { params: { id: string } }) {
	const authError = await requireAdmin(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { id } = params;

	const { error } = await supabase.from('group_bonus_setting').delete().eq('id', id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json({ success: true });
}
