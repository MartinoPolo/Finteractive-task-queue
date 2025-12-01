import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import { borderRadius, colors } from '../../theme/theme';

export interface BadgeProps {
	color: string;
	label: string;
	textColor?: string;
}

export const Badge = memo(function Badge({
	color,
	label,
	textColor = colors.primary.contrastText
}: BadgeProps) {
	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				px: 1.5,
				py: 0.5,
				borderRadius: borderRadius.full,
				backgroundColor: color,
				color: textColor
			}}
		>
			<Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'inherit' }}>
				{label}
			</Typography>
		</Box>
	);
});
