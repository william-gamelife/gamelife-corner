// Mock createClient first
jest.mock('@/lib/supabase/client', () => ({
	createClient: () => ({
		auth: {
			setSession: jest.fn(),
			signOut: jest.fn(),
			getSession: jest.fn(),
			getUser: jest.fn(),
			onAuthStateChange: jest.fn(),
			refreshSession: jest.fn()
		},
		from: jest.fn()
	})
}));

import { SupabaseAuth } from '@/lib/auth/supabaseAuth';

// Get the mocked client for testing
const mockSupabaseClient = {
	auth: {
		setSession: jest.fn(),
		signOut: jest.fn(),
		getSession: jest.fn(),
		getUser: jest.fn(),
		onAuthStateChange: jest.fn(),
		refreshSession: jest.fn()
	},
	from: jest.fn()
};

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('SupabaseAuth', () => {
	let supabaseAuth: SupabaseAuth;

	beforeEach(() => {
		jest.clearAllMocks();
		supabaseAuth = new SupabaseAuth();
	});

	describe('登入功能', () => {
		it('應該成功登入並設置 session', async () => {
			const mockResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue({
					success: true,
					user: { id: 'testuser', name: '測試用戶' },
					session: {
						access_token: 'access-token',
						refresh_token: 'refresh-token'
					}
				})
			};

			mockFetch.mockResolvedValue(mockResponse as Response);
			mockSupabaseClient.auth.setSession.mockResolvedValue({ error: null });

			const result = await supabaseAuth.signIn('testuser', 'password');

			expect(result.success).toBe(true);
			expect(result.user).toEqual({ id: 'testuser', name: '測試用戶' });
			expect(mockFetch).toHaveBeenCalledWith('/api/supabase/users', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: 'testuser', password: 'password' })
			});
			expect(mockSupabaseClient.auth.setSession).toHaveBeenCalledWith({
				access_token: 'access-token',
				refresh_token: 'refresh-token'
			});
		});

		it('應該處理登入失敗', async () => {
			const mockResponse = {
				ok: false,
				json: jest.fn().mockResolvedValue({
					message: '帳號或密碼錯誤'
				})
			};

			mockFetch.mockResolvedValue(mockResponse as Response);

			const result = await supabaseAuth.signIn('testuser', 'wrongpassword');

			expect(result.success).toBe(false);
			expect(result.error).toBe('帳號或密碼錯誤');
			expect(mockSupabaseClient.auth.setSession).not.toHaveBeenCalled();
		});

		it('應該處理網路錯誤', async () => {
			mockFetch.mockRejectedValue(new Error('Network error'));

			const result = await supabaseAuth.signIn('testuser', 'password');

			expect(result.success).toBe(false);
			expect(result.error).toBe('登入失敗');
		});
	});

	describe('登出功能', () => {
		it('應該成功登出', async () => {
			mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

			const result = await supabaseAuth.signOut();

			expect(result.success).toBe(true);
			expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
		});

		it('應該處理登出錯誤', async () => {
			mockSupabaseClient.auth.signOut.mockResolvedValue({
				error: { message: '登出失敗' }
			});

			const result = await supabaseAuth.signOut();

			expect(result.success).toBe(false);
			expect(result.error).toBe('登出失敗');
		});
	});

	describe('取得目前使用者', () => {
		it('應該成功取得使用者資訊', async () => {
			const mockSession = {
				access_token: 'token',
				user: { email: 'testuser@company.com' }
			};
			const mockUser = { email: 'testuser@company.com' };
			const mockUserData = {
				id: 'testuser',
				name: '測試用戶',
				startOfDuty: '2023-01-01',
				endOfDuty: null
			};

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			});
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null
			});

			const mockResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue(mockUserData)
			};
			mockFetch.mockResolvedValue(mockResponse as Response);

			const result = await supabaseAuth.getCurrentUser();

			expect(result.success).toBe(true);
			expect(result.user).toEqual(mockUserData);
			expect(result.session).toEqual(mockSession);
			expect(mockFetch).toHaveBeenCalledWith('/api/supabase/users/testuser', {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' }
			});
		});

		it('應該檢查在職狀態 - 尚未到職', async () => {
			const mockSession = {
				access_token: 'token',
				user: { email: 'testuser@company.com' }
			};
			const mockUser = { email: 'testuser@company.com' };
			const futureDate = new Date();
			futureDate.setDate(futureDate.getDate() + 1);

			const mockUserData = {
				id: 'testuser',
				name: '測試用戶',
				startOfDuty: futureDate.toISOString(),
				endOfDuty: null
			};

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			});
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null
			});

			const mockResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue(mockUserData)
			};
			mockFetch.mockResolvedValue(mockResponse as Response);

			const result = await supabaseAuth.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.error).toBe('您尚未到職，無法登入系統');
		});

		it('應該檢查在職狀態 - 已離職', async () => {
			const mockSession = {
				access_token: 'token',
				user: { email: 'testuser@company.com' }
			};
			const mockUser = { email: 'testuser@company.com' };
			const pastDate = new Date();
			pastDate.setDate(pastDate.getDate() - 1);

			const mockUserData = {
				id: 'testuser',
				name: '測試用戶',
				startOfDuty: '2023-01-01',
				endOfDuty: pastDate.toISOString()
			};

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			});
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null
			});

			const mockResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue(mockUserData)
			};
			mockFetch.mockResolvedValue(mockResponse as Response);

			const result = await supabaseAuth.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.error).toBe('您已離職，無法登入系統');
		});

		it('應該處理無效的 session', async () => {
			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: null },
				error: null
			});

			const result = await supabaseAuth.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.error).toBe('未登入');
		});

		it('應該處理無效的 email 格式', async () => {
			const mockSession = {
				access_token: 'token',
				user: { email: 'invalid-email' }
			};
			const mockUser = { email: 'invalid-email' };

			mockSupabaseClient.auth.getSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			});
			mockSupabaseClient.auth.getUser.mockResolvedValue({
				data: { user: mockUser },
				error: null
			});

			const result = await supabaseAuth.getCurrentUser();

			expect(result.success).toBe(false);
			expect(result.error).toBe('無效的使用者');
		});
	});

	describe('Session 刷新', () => {
		it('應該成功刷新 session', async () => {
			const mockSession = { access_token: 'new-token' };
			mockSupabaseClient.auth.refreshSession.mockResolvedValue({
				data: { session: mockSession },
				error: null
			});

			const result = await supabaseAuth.refreshSession();

			expect(result.success).toBe(true);
			expect(result.session).toEqual(mockSession);
		});

		it('應該處理刷新失敗', async () => {
			mockSupabaseClient.auth.refreshSession.mockResolvedValue({
				data: { session: null },
				error: { message: '刷新失敗' }
			});

			const result = await supabaseAuth.refreshSession();

			expect(result.success).toBe(false);
			expect(result.error).toBe('刷新失敗');
		});
	});

	describe('認證狀態監聽', () => {
		it('應該監聽認證狀態變化', () => {
			const mockCallback = jest.fn();
			const mockSubscription = {
				data: { subscription: { unsubscribe: jest.fn() } }
			};

			mockSupabaseClient.auth.onAuthStateChange.mockReturnValue(mockSubscription);

			const result = supabaseAuth.onAuthStateChange(mockCallback);

			expect(mockSupabaseClient.auth.onAuthStateChange).toHaveBeenCalled();
			expect(result).toEqual(mockSubscription);
		});

		it('應該處理 SIGNED_IN 事件', async () => {
			const mockCallback = jest.fn();
			const mockSession = {
				user: { email: 'testuser@company.com' }
			};
			const mockUserData = { id: 'testuser', name: '測試用戶' };

			// Mock 模擬監聽器被觸發
			mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
				// 模擬觸發 SIGNED_IN 事件
				setTimeout(() => {
					callback('SIGNED_IN', mockSession);
				}, 0);

				return { data: { subscription: { unsubscribe: jest.fn() } } };
			});

			// Mock getUserInfo 返回
			const mockResponse = {
				ok: true,
				json: jest.fn().mockResolvedValue(mockUserData)
			};
			mockFetch.mockResolvedValue(mockResponse as Response);

			supabaseAuth.onAuthStateChange(mockCallback);

			// 等待異步操作完成
			await new Promise((resolve) => setTimeout(resolve, 10));

			expect(mockCallback).toHaveBeenCalledWith(mockSession, mockUserData);
		});

		it('應該處理 SIGNED_OUT 事件', () => {
			const mockCallback = jest.fn();

			mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
				// 模擬觸發 SIGNED_OUT 事件
				setTimeout(() => {
					callback('SIGNED_OUT', null);
				}, 0);

				return { data: { subscription: { unsubscribe: jest.fn() } } };
			});

			supabaseAuth.onAuthStateChange(mockCallback);

			// 等待事件觸發
			setTimeout(() => {
				expect(mockCallback).toHaveBeenCalledWith(null);
			}, 10);
		});
	});
});
