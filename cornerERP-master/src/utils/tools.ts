import imageCompression from 'browser-image-compression';

export function toCamelCase<T>(obj: Record<string, unknown>): Partial<T> {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		const camelKey = key.replace(/(_\w)/g, (m) => m[1].toUpperCase());
		(acc as Record<string, unknown>)[camelKey] = value;
		return acc;
	}, {} as Partial<T>);
}

export function toSnakeCase<T extends Record<string, unknown>>(obj: Record<string, unknown>): Partial<T> {
	return Object.entries(obj).reduce((acc, [key, value]) => {
		const snakeKey = key.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
		(acc as Record<string, unknown>)[snakeKey] = value;
		return acc;
	}, {} as Partial<T>);
}

interface ImageCompressionOptions {
	maxSizeMB?: number;
	maxWidthOrHeight?: number;
	useWebWorker?: boolean;
}

export async function compressImage(file: File, maxSizeMB = 0.5, options: ImageCompressionOptions = {}): Promise<File> {
	const defaultOptions = {
		maxSizeMB, // 預設壓縮到 500KB
		maxWidthOrHeight: 1024, // 預設最大寬度或高度為 1024px
		useWebWorker: true
	};

	try {
		return await imageCompression(file, { ...defaultOptions, ...options });
	} catch (error) {
		console.error('圖片壓縮失敗:', error);
		return file;
	}
}

export function convertToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result as string);
		reader.onerror = (error) => reject(error);
	});
}
/**
 * 生成唯一ID
 */
export function generateId(length = 8): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
}
