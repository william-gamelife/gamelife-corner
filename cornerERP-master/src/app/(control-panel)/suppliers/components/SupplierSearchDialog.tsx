import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import { MenuItem } from '@mui/material';
import { Select } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { InputLabel } from '@mui/material';
import { SUPPLIER_TYPES_NAMES } from '@/constants/supplierTypes';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import { GetSuppliersApiArg } from '../SupplierApi';

interface SupplierSearchDialogProps {
	open: boolean;
	onClose: () => void;
	onSearch: (params: GetSuppliersApiArg) => void;
	initialParams: GetSuppliersApiArg;
}

export default function SupplierSearchDialog({ open, onClose, onSearch, initialParams }: SupplierSearchDialogProps) {
	const [params, setParams] = useState(initialParams);

	useEffect(() => {
		if (open) {
			setParams(initialParams);
		}
	}, [open, initialParams]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setParams((prev) => ({
			...prev,
			[name]: value
		}));
	};

	const handleTypeChange = (event) => {
		const {
			target: { value }
		} = event;
		setParams({
			...params,
			supplierType: typeof value === 'string' ? value.split(',') : value
		});
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setParams((prev) => ({
			...prev,
			[name]: checked
		}));
	};

	const handleSubmit = () => {
		onSearch(params);
		onClose();
	};

	const handleReset = () => {
		const defaultParams: GetSuppliersApiArg = {};
		setParams(defaultParams);
		onSearch(defaultParams);
		onClose();
	};

	return (
		<Dialog
			open={open}
			onClose={onClose}
			maxWidth="md"
			fullWidth
		>
			<DialogTitle>詳細搜尋供應商</DialogTitle>
			<DialogContent>
				<Grid
					container
					spacing={2}
					sx={{ mt: 1 }}
				>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="supplierCode"
							label="供應商編號"
							value={params.supplierCode || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<TextField
							name="supplierName"
							label="供應商名稱"
							value={params.supplierName || ''}
							onChange={handleChange}
							fullWidth
							variant="outlined"
							size="small"
						/>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<FormControl
							fullWidth
							size="small"
						>
							<InputLabel id="supplier-type-label">供應商類型</InputLabel>
							<Select
								labelId="supplier-type-label"
								id="supplierType"
								multiple
								value={params.supplierType || []}
								onChange={handleTypeChange}
								label="供應商類型"
							>
								{Object.entries(SUPPLIER_TYPES_NAMES).map(([key, name]) => (
									<MenuItem
										key={key}
										value={key}
									>
										{name}
									</MenuItem>
								))}
							</Select>
						</FormControl>
					</Grid>
					<Grid
						item
						xs={12}
						md={6}
					>
						<FormControlLabel
							control={
								<Checkbox
									name="isQuoted"
									checked={params.isQuoted || false}
									onChange={handleCheckboxChange}
								/>
							}
							label="有B2B報價"
						/>
					</Grid>
				</Grid>
			</DialogContent>
			<DialogActions>
				<Button
					onClick={handleReset}
					color="inherit"
				>
					重設
				</Button>
				<Button onClick={onClose}>取消</Button>
				<Button
					onClick={handleSubmit}
					variant="contained"
					color="primary"
				>
					搜尋
				</Button>
			</DialogActions>
		</Dialog>
	);
}
