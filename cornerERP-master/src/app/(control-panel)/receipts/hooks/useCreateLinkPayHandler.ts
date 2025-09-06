import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateLinkPayMutation } from '../ReceiptApi';

/**
 * 創建 LinkPay 的共用 hook
 * @returns 創建 LinkPay 的處理函數和狀態
 */
export function useCreateLinkPayHandler() {
	const { enqueueSnackbar } = useSnackbar();
	const [isCreating, setIsCreating] = useState(false);
	const [createLinkPay] = useCreateLinkPayMutation();
	const { session, user } = useAuth();

	/**
	 * 處理創建 LinkPay
	 * @param receiptNumber 收據編號
	 * @param receiptAccount 收款帳號
	 * @param email 電子郵件
	 * @param onSuccess 成功回調函數
	 */
	const handleCreateLinkPay = async (
		receiptNumber: string,
		receiptAccount: string,
		email: string,
		onSuccess?: () => void,
		paymentName?: string
	) => {
		try {
			setIsCreating(true);

			// 使用 RTK Query mutation 來創建 LinkPay
			const result = await createLinkPay({
				receiptNumber,
				userName: receiptAccount,
				email: email || '',
				paymentName: paymentName || '',
				createUser: user?.id || ''
			}).unwrap();

			if (result.success) {
				enqueueSnackbar('LinkPay 付款連結生成成功', { variant: 'success' });

				// 如果提供了回調函數，則調用它
				if (onSuccess) {
					onSuccess();
				}

				return true;
			} else {
				enqueueSnackbar(result.message || '生成 LinkPay 連結失敗', { variant: 'error' });
				return false;
			}
		} catch (error) {
			console.error('生成 LinkPay 連結失敗:', error);
			enqueueSnackbar('生成 LinkPay 連結失敗，請稍後再試', { variant: 'error' });
			return false;
		} finally {
			setIsCreating(false);
		}
	};

	return {
		handleCreateLinkPay,
		isCreating
	};
}
