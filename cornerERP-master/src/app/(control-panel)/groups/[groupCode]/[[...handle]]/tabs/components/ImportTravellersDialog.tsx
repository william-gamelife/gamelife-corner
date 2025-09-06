'use client';

import { useState } from 'react';
import {
	Button,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	Typography,
	Alert,
	Box,
	CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';

interface ImportTravellersDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: (file: File) => Promise<void>;
	isLoading?: boolean;
}

function ImportTravellersDialog({ open, onClose, onConfirm, isLoading = false }: ImportTravellersDialogProps) {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [error, setError] = useState<string>('');
	const [isDragging, setIsDragging] = useState(false);

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		validateAndSetFile(file);
	};

	const validateAndSetFile = (file: File | null | undefined) => {
		if (!file) {
			setError('請選擇檔案');
			return;
		}

		// 檢查檔案類型
		const validTypes = [
			'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'application/vnd.ms-excel'
		];
		const fileExtension = file.name.split('.').pop()?.toLowerCase();

		if (!validTypes.includes(file.type) && fileExtension !== 'xlsx') {
			setError('檔案格式錯誤，請上傳 .xlsx Excel 檔案');
			setSelectedFile(null);
			return;
		}

		// 檢查檔案大小 (10MB)
		const maxSize = 10 * 1024 * 1024;

		if (file.size > maxSize) {
			setError('檔案大小超過 10MB 限制');
			setSelectedFile(null);
			return;
		}

		setError('');
		setSelectedFile(file);
	};

	const handleDragOver = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		setIsDragging(false);
		const file = event.dataTransfer.files[0];
		validateAndSetFile(file);
	};

	const handleConfirm = async () => {
		if (!selectedFile) {
			setError('請選擇檔案');
			return;
		}

		try {
			await onConfirm(selectedFile);
			handleClose();
		} catch (err) {
			setError(err instanceof Error ? err.message : '上傳失敗，請稍後再試');
		}
	};

	const handleClose = () => {
		if (!isLoading) {
			setSelectedFile(null);
			setError('');
			setIsDragging(false);
			onClose();
		}
	};

	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				// 載入中時，忽略背景點擊和 ESC 鍵
				if (isLoading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
					return;
				}

				handleClose();
			}}
			maxWidth="sm"
			fullWidth
		>
			<DialogTitle>匯入旅客資訊</DialogTitle>
			<DialogContent>
				<Alert
					severity="warning"
					className="mb-4"
				>
					<Typography variant="body2">
						<strong>重要提醒：</strong>
						<br />
						請確認 Excel 檔案中的資料都是正確的。
						<br />
						此操作會清空目前團的旅客資料，以此檔案為主。
					</Typography>
				</Alert>

				<Box
					className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
						isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'
					} ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<CloudUploadIcon
						className="mx-auto mb-4 text-gray-400"
						sx={{ fontSize: 48 }}
					/>

					{selectedFile ? (
						<div>
							<Typography
								variant="body1"
								className="mb-2"
							>
								已選擇檔案：
							</Typography>
							<Typography
								variant="body2"
								color="primary"
								className="font-medium"
							>
								{selectedFile.name}
							</Typography>
							<Typography
								variant="caption"
								color="textSecondary"
							>
								({(selectedFile.size / 1024).toFixed(2)} KB)
							</Typography>
						</div>
					) : (
						<div>
							<Typography
								variant="body1"
								className="mb-2"
							>
								拖曳檔案至此處，或點擊選擇檔案
							</Typography>
							<Typography
								variant="caption"
								color="textSecondary"
							>
								僅支援 .xlsx Excel 檔案，最大 10MB
							</Typography>
						</div>
					)}

					<input
						type="file"
						accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
						onChange={handleFileSelect}
						style={{
							position: 'absolute',
							width: '100%',
							height: '100%',
							top: 0,
							left: 0,
							opacity: 0,
							cursor: 'pointer'
						}}
						disabled={isLoading}
					/>
				</Box>

				{error && (
					<Alert
						severity="error"
						className="mt-4"
					>
						{error}
					</Alert>
				)}

				{selectedFile && !error && (
					<Alert
						severity="info"
						className="mt-4"
					>
						<Typography variant="caption">請確認檔案內容正確後，點擊「確認匯入」按鈕。</Typography>
					</Alert>
				)}
			</DialogContent>

			<DialogActions>
				<Button
					onClick={handleClose}
					disabled={isLoading}
				>
					取消
				</Button>
				<Button
					onClick={handleConfirm}
					color="primary"
					variant="contained"
					disabled={!selectedFile || !!error || isLoading}
					startIcon={isLoading ? <CircularProgress size={20} /> : null}
				>
					{isLoading ? '匯入中...' : '確認匯入'}
				</Button>
			</DialogActions>
		</Dialog>
	);
}

export default ImportTravellersDialog;
