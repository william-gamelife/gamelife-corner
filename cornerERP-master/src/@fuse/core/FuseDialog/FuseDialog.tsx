import Dialog from '@mui/material/Dialog';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import { closeDialog, selectFuseDialogProps } from '@fuse/core/FuseDialog/fuseDialogSlice';
import { useDialogClose } from 'src/hooks/useDialogClose';

/**
 * FuseDialog component
 * This component renders a material UI ```Dialog``` component
 * with properties pulled from the redux store
 */
function FuseDialog() {
	const dispatch = useAppDispatch();
	const options = useAppSelector(selectFuseDialogProps);

	// 使用自定義 Hook 處理對話框關閉
	const handleClose = useDialogClose(() => dispatch(closeDialog()));

	return (
		<Dialog
			onClose={handleClose}
			aria-labelledby="fuse-dialog-title"
			classes={{
				paper: 'rounded-lg'
			}}
			{...options}
		/>
	);
}

export default FuseDialog;
