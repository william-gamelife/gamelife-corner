import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getTaipeiTimestamp } from '@/utils/timezone';

export async function GET(req: NextRequest, props: { params: { key: string } }) {
	const authError = await requireAuth(req);

	if (authError) {
		return authError;
	}

	const supabase = await createClient();
	const { key } = await props.params;

	// 先嘗試查詢現有記錄
	const { data, error } = await supabase.from('max_numbers').select('*').eq('key', key).single();

	if (error) {
		// 如果找不到記錄，新增一筆
		const { data: insertData, error: insertError } = await supabase
			.from('max_numbers')
			.insert([
				{
					key: key,
					max_number: 1,
					modified_at: getTaipeiTimestamp()
				}
			])
			.select()
			.single();

		if (insertError) {
			return NextResponse.json({ message: '新增記錄失敗' }, { status: 500 });
		}

		return NextResponse.json({ maxNumber: 1 }, { status: 200 });
	}

	// 如果找到記錄，更新 max_number
	const newMaxNumber = data.max_number + 1;
	const { error: updateError } = await supabase
		.from('max_numbers')
		.update({
			max_number: newMaxNumber,
			modified_at: getTaipeiTimestamp()
		})
		.eq('key', key);

	if (updateError) {
		return NextResponse.json({ message: '更新記錄失敗' }, { status: 500 });
	}

	return NextResponse.json({ maxNumber: newMaxNumber }, { status: 200 });
}
