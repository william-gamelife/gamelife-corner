import { Button, ButtonProps, CircularProgress } from '@mui/material';
import React from 'react';

interface LoadingButtonProps extends ButtonProps {
	isLoading: boolean;
	loadingText?: string;
	children: React.ReactNode;
}

function LoadingButton({ isLoading, loadingText, children, disabled, startIcon, ...rest }: LoadingButtonProps) {
	return (
		<Button
			{...rest}
			disabled={disabled || isLoading}
			startIcon={
				isLoading ? (
					<CircularProgress
						size={20}
						color="inherit"
					/>
				) : (
					startIcon
				)
			}
		>
			{isLoading ? loadingText || '處理中...' : children}
		</Button>
	);
}

export default LoadingButton;
