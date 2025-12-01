import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import { borderRadius, colors, getPriorityColor, getPriorityLabel } from '../../theme/theme';

interface PriorityBadgeProps {
	priority: number;
	showLabel?: boolean;
}

export const PriorityBadge = memo(function PriorityBadge({
	priority,
	showLabel = true
}: PriorityBadgeProps) {
	const color = getPriorityColor(priority);
	const label = getPriorityLabel(priority);

	return (
		<Box
			sx={{
				display: 'inline-flex',
				alignItems: 'center',
				px: 1.5,
				py: 0.5,
				borderRadius: borderRadius.full,
				backgroundColor: color,
				color: colors.primary.contrastText
			}}
		>
			<Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.75rem', color: 'inherit' }}>
				{showLabel ? `${label} (${priority})` : `Priority: ${priority}`}
			</Typography>
		</Box>
	);
});
