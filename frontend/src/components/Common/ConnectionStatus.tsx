import { Box, Typography } from '@mui/material';
import { memo } from 'react';
import { animations, getConnectionStatusConfig } from '../../theme/theme';
import type { ConnectionStatus as ConnectionStatusType } from '../../types/socket';

interface ConnectionStatusProps {
	status: ConnectionStatusType;
}

export const ConnectionStatus = memo(function ConnectionStatus({ status }: ConnectionStatusProps) {
	const config = getConnectionStatusConfig(status);
	const isAnimated = status !== 'connected';

	return (
		<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
			<Box
				sx={{
					width: 12,
					height: 12,
					borderRadius: '50%',
					backgroundColor: config.color,
					animation: isAnimated ? 'pulse 1.5s ease-in-out infinite' : undefined,
					...animations.pulse
				}}
			/>
			<Typography
				variant="body2"
				sx={{
					color: config.color,
					fontWeight: 'fontWeightMedium'
				}}
			>
				{config.label}
			</Typography>
		</Box>
	);
});
