import { useCallback } from 'react';

/**
 * 自定義 Hook，用於處理對話框關閉時的無障礙性問題
 * @param onClose 原始的關閉回調函數
 * @returns 處理後的關閉回調函數
 */
export function useDialogClose(onClose: () => void) {
	const handleClose = useCallback(() => {
		// 在關閉對話框前，將焦點移到 document.body
		document.body.focus();
		// 延遲執行關閉操作，確保焦點已經轉移
		setTimeout(() => {
			onClose();
		}, 0);
	}, [onClose]);

	return handleClose;
}
