import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { motion } from 'motion/react';
import Box from '@mui/material/Box';

/**
 * The powered by links.
 */
function PoweredByLinks() {
	const container = {
		show: {
			transition: {
				staggerChildren: 0.04
			}
		}
	};

	const item = {
		hidden: { opacity: 0, scale: 0.6 },
		show: { opacity: 1, scale: 1 }
	};

	return (
		<Box
			component={motion.div}
			variants={container}
			initial="hidden"
			animate="show"
			className="flex items-center rounded-lg overflow-hidden"
			sx={(theme) => ({
				border: `1px solid ${theme.palette.divider}!important`
			})}
		>
			<Tooltip
				title="Next.js"
				placement="top"
			>
				<IconButton
					className="min-h-10 w-11 flex justify-center items-center rounded-none"
					component={motion.a}
					variants={item}
					href="https://nextjs.org"
					target="_blank"
					rel="noreferrer noopener"
					role="button"
				>
					<img
						src="/assets/images/logo/nextjs-dark.svg"
						alt="next.js"
						className="min-w-0 w-7"
					/>
				</IconButton>
			</Tooltip>
			<Tooltip
				title="Auth.js"
				placement="top"
			>
				<IconButton
					className="min-h-10 w-11 flex justify-center items-center rounded-none"
					component={motion.a}
					variants={item}
					href="https://authjs.dev/"
					target="_blank"
					rel="noreferrer noopener"
					role="button"
				>
					<img
						src="/assets/images/logo/authjs.webp"
						alt="next.js"
						className="min-w-0 w-6"
					/>
				</IconButton>
			</Tooltip>
			<Tooltip
				title="TypeScript"
				placement="top"
			>
				<IconButton
					className="min-h-10 w-11 flex justify-center items-center rounded-none"
					component={motion.a}
					variants={item}
					href="https://www.typescriptlang.org/"
					target="_blank"
					rel="noreferrer noopener"
					role="button"
				>
					<Box
						className="min-w-7 w-7 h-7 rounded-2 px-1 py-0.25 flex items-end justify-end"
						sx={{ backgroundColor: '#2e79c7!important', color: '#ffffff!important' }}
					>
						<span className="react-text text-sm font-semibold">TS</span>
					</Box>
				</IconButton>
			</Tooltip>
		</Box>
	);
}

export default PoweredByLinks;
