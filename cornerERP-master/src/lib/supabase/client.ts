import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
	return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
}

export async function supabaseClientSignOut() {
	const supabase = await createClient();
	const { error } = await supabase.auth.signOut();

	if (error) {
		console.error('登出時發生錯誤:', error.message);
		throw error;
	}

	return { success: true };
}
