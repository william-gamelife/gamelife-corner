import { styled } from '@mui/material';

/**
 * 出納單預覽共用樣式組件
 */
export const BillPreviewRoot = styled('div')(({ theme }) => ({
	'& table ': {
		'& th:first-of-type, & td:first-of-type': {
			paddingLeft: `${0}!important`
		},
		'& th:last-child, & td:last-child': {
			paddingRight: `${0}!important`
		},
		' & td.noPL': {
			paddingLeft: `${8}px!important`
		},
		'& td.noPR': {
			paddingRight: `${8}px!important`
		}
	},

	'& .divider': {
		width: 1,
		backgroundColor: theme.palette.divider,
		height: 144
	},

	'& .seller': {
		backgroundColor: theme.palette.primary.dark,
		color: theme.palette.getContrastText(theme.palette.primary.dark),
		marginRight: -88,
		paddingRight: 66,
		width: 480,
		'& .divider': {
			backgroundColor: theme.palette.getContrastText(theme.palette.primary.dark),
			opacity: 0.5
		}
	}
}));
