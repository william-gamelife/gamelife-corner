'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { TextField, Button, Alert, Box, InputAdornment, IconButton } from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

export default function SupabaseSignInForm() {
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { signIn } = useAuth();
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		try {
			const result = await signIn(id, password);

			if (result.success) {
				router.push('/');
			} else {
				setError(result.error || '登入失敗');
			}
		} catch (err) {
			setError('登入過程發生錯誤');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Box
			component="form"
			onSubmit={handleSubmit}
			className="mt-8 space-y-6"
		>
			{error && (
				<Alert
					severity="error"
					className="mb-4"
				>
					{error}
				</Alert>
			)}

			<TextField
				fullWidth
				name="username"
				label="員工編號"
				value={id}
				onChange={(e) => setId(e.target.value)}
				required
				disabled={loading}
				autoComplete="username"
			/>

			<TextField
				fullWidth
				label="密碼"
				name="password"
				type={showPassword ? 'text' : 'password'}
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				required
				disabled={loading}
				autoComplete="current-password"
				InputProps={{
					endAdornment: (
						<InputAdornment position="end">
							<IconButton
								onClick={() => setShowPassword(!showPassword)}
								edge="end"
								disabled={loading}
							>
								{showPassword ? <VisibilityOff /> : <Visibility />}
							</IconButton>
						</InputAdornment>
					)
				}}
			/>

			<Button
				type="submit"
				fullWidth
				variant="contained"
				size="large"
				disabled={loading || !id || !password}
				className="mt-6"
			>
				{loading ? '登入中...' : '登入'}
			</Button>
		</Box>
	);
}
