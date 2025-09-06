import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { supabaseAuth } from '@/lib/auth/supabaseAuth';

// Mock Supabase auth
jest.mock('@/lib/auth/supabaseAuth', () => ({
	supabaseAuth: {
		signIn: jest.fn(),
		signOut: jest.fn(),
		getCurrentUser: jest.fn(),
		refreshSession: jest.fn(),
		onAuthStateChange: jest.fn(() => ({
			data: {
				subscription: {
					unsubscribe: jest.fn()
				}
			}
		}))
	}
}));

const mockSupabaseAuth = supabaseAuth as jest.Mocked<typeof supabaseAuth>;

// Test wrapper
const createWrapper = () => {
	const TestWrapper = ({ children }: { children: ReactNode }) => <AuthProvider>{children}</AuthProvider>;
	TestWrapper.displayName = 'TestWrapper';
	return TestWrapper;
};

describe('AuthContext', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		// 預設返回未登入狀態
		mockSupabaseAuth.getCurrentUser.mockResolvedValue({
			success: false,
			error: '未登入'
		});
	});

	describe('useAuth hook', () => {
		it('應該拋出錯誤當不在 AuthProvider 中使用', () => {
			// 使用 console.error 來捕獲錯誤而不是讓測試失敗
			const originalError = console.error;
			console.error = jest.fn();

			const { result } = renderHook(() => useAuth());
			expect(result.error).toEqual(new Error('useAuth must be used within an AuthProvider'));

			console.error = originalError;
		});

		it('應該提供初始的認證狀態', async () => {
			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			// 等待初始化完成
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
			expect(result.current.loading).toBe(false);
		});
	});

	describe('登入功能', () => {
		it('應該成功登入並更新狀態', async () => {
			const mockUser = {
				id: 'testuser',
				name: '測試用戶',
				role: 'user'
			};
			const mockSession = {
				access_token: 'mock-token',
				refresh_token: 'mock-refresh-token'
			};

			mockSupabaseAuth.signIn.mockResolvedValue({
				success: true,
				user: mockUser,
				session: mockSession
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				const response = await result.current.signIn('testuser', 'password');
				expect(response.success).toBe(true);
			});

			expect(result.current.user).toEqual(mockUser);
			expect(result.current.session).toEqual(mockSession);
			expect(mockSupabaseAuth.signIn).toHaveBeenCalledWith('testuser', 'password');
		});

		it('應該處理登入失敗', async () => {
			mockSupabaseAuth.signIn.mockResolvedValue({
				success: false,
				error: '帳號或密碼錯誤'
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				const response = await result.current.signIn('testuser', 'wrongpassword');
				expect(response.success).toBe(false);
				expect(response.error).toBe('帳號或密碼錯誤');
			});

			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
		});

		it('應該在登入過程中設置 loading 狀態', async () => {
			let resolveSignIn: (value: {
				success: boolean;
				user?: { id: string };
				session?: { access_token: string };
			}) => void;
			const signInPromise = new Promise((resolve) => {
				resolveSignIn = resolve;
			});

			mockSupabaseAuth.signIn.mockReturnValue(signInPromise);

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			// 開始登入
			act(() => {
				result.current.signIn('testuser', 'password');
			});

			// 檢查 loading 狀態
			expect(result.current.loading).toBe(true);

			// 完成登入
			await act(async () => {
				resolveSignIn!({
					success: true,
					user: { id: 'testuser' },
					session: { access_token: 'token' }
				});
				await signInPromise;
			});

			expect(result.current.loading).toBe(false);
		});
	});

	describe('登出功能', () => {
		it('應該成功登出並清除狀態', async () => {
			// 先設置已登入狀態
			const mockUser = { id: 'testuser', name: '測試用戶' };
			const mockSession = { access_token: 'token' };

			mockSupabaseAuth.getCurrentUser.mockResolvedValue({
				success: true,
				user: mockUser,
				session: mockSession
			});

			mockSupabaseAuth.signOut.mockResolvedValue({
				success: true
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			// 等待初始化完成
			await act(async () => {
				await new Promise((resolve) => setTimeout(resolve, 0));
			});

			// 執行登出
			await act(async () => {
				await result.current.signOut();
			});

			expect(result.current.user).toBe(null);
			expect(result.current.session).toBe(null);
			expect(mockSupabaseAuth.signOut).toHaveBeenCalled();
		});
	});

	describe('Session 刷新', () => {
		it('應該能夠刷新 session', async () => {
			const mockSession = {
				access_token: 'new-token',
				refresh_token: 'new-refresh-token'
			};

			mockSupabaseAuth.refreshSession.mockResolvedValue({
				success: true,
				session: mockSession
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.refreshSession();
			});

			expect(result.current.session).toEqual(mockSession);
			expect(mockSupabaseAuth.refreshSession).toHaveBeenCalled();
		});

		it('應該處理刷新失敗', async () => {
			mockSupabaseAuth.refreshSession.mockResolvedValue({
				success: false,
				error: '刷新失敗'
			});

			const wrapper = createWrapper();
			const { result } = renderHook(() => useAuth(), { wrapper });

			await act(async () => {
				await result.current.refreshSession();
			});

			// session 應該保持不變
			expect(result.current.session).toBe(null);
		});
	});

	describe('認證狀態監聽', () => {
		it('應該監聽認證狀態變化', () => {
			const wrapper = createWrapper();
			renderHook(() => useAuth(), { wrapper });

			expect(mockSupabaseAuth.onAuthStateChange).toHaveBeenCalled();
		});

		it('應該在組件卸載時取消監聽', () => {
			const mockUnsubscribe = jest.fn();
			mockSupabaseAuth.onAuthStateChange.mockReturnValue({
				data: {
					subscription: {
						unsubscribe: mockUnsubscribe
					}
				}
			});

			const wrapper = createWrapper();
			const { unmount } = renderHook(() => useAuth(), { wrapper });

			unmount();

			expect(mockUnsubscribe).toHaveBeenCalled();
		});
	});
});
