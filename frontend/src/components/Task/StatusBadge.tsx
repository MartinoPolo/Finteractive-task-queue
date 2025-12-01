import { memo } from 'react';
import { colors } from '../../theme/theme';
import type { TaskStatus } from '../../types/task';
import { Badge } from './Badge';

interface StatusBadgeProps {
	status: TaskStatus;
}

function getStatusColor(status: TaskStatus): string {
	switch (status) {
		case 'completed':
			return colors.success.main;
		case 'processing':
			return colors.primary.main;
		case 'queued':
		default:
			return colors.neutral.text.muted;
	}
}

function getStatusLabel(status: TaskStatus): string {
	switch (status) {
		case 'completed':
			return 'Completed';
		case 'processing':
			return 'Processing';
		case 'queued':
		default:
			return 'Pending';
	}
}

export const StatusBadge = memo(function StatusBadge({ status }: StatusBadgeProps) {
	const color = getStatusColor(status);
	const label = getStatusLabel(status);

	return <Badge color={color} label={label} />;
});
