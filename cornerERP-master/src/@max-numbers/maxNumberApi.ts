import apiFetch from '@/utils/apiFetch';

/**
 * Get max number
 */
export async function maxNumberGetDbNumber(key: string, pad: number): Promise<string> {
	const response = await apiFetch(`/api/supabase/max-numbers/${key}`);
	const data = await response.json();
	return `${key}${data.maxNumber.toString().padStart(pad, '0')}`;
}
