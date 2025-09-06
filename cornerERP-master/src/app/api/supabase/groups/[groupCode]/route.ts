import { NextRequest, NextResponse } from 'next/server';
import { toCamelCase, toSnakeCase } from '@/utils/tools';
import { Group } from '@/app/(control-panel)/groups/GroupApi';
import { createClient } from '@/lib/supabase/server';
import GroupModel from '@/app/(control-panel)/groups/models/GroupModel';
import { requireAuth } from '@/lib/auth/middleware';
export async function GET(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { groupCode } = params;

	const { data, error } = await supabase.from('groups').select('*').eq('group_code', groupCode).single();

	if (error) {
		return NextResponse.json({ message: 'Group not found' }, { status: 404 });
	}

	return NextResponse.json(toCamelCase<Group>(data), { status: 200 });
}

export async function PUT(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { groupCode } = params;
	const group = (await req.json()) as Group;
	const snakeCaseGroup = toSnakeCase<Group>(GroupModel(group));

	const { data, error } = await supabase
		.from('groups')
		.update(snakeCaseGroup)
		.eq('group_code', groupCode)
		.select()
		.single();

	if (error) {
		console.error(error);
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json(toCamelCase<Group>(data), { status: 200 });
}

export async function DELETE(req: NextRequest, props: { params: { groupCode: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const params = await props.params;
	const { groupCode } = params;

	const { error } = await supabase.from('groups').delete().eq('group_code', groupCode);

	if (error) {
		return NextResponse.json({ message: error.message }, { status: 400 });
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
