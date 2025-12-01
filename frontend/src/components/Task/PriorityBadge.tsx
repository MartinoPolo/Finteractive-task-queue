import { memo } from 'react';
import { getPriorityColor, getPriorityLabel } from '../../theme/theme';
import { Badge } from './Badge';

interface PriorityBadgeProps {
	priority: number;
	showLabel?: boolean;
}

export const PriorityBadge = memo(function PriorityBadge({
	priority,
	showLabel = true
}: PriorityBadgeProps) {
	const color = getPriorityColor(priority);
	const priorityLabel = getPriorityLabel(priority);
	const label = showLabel ? `${priorityLabel} (${priority})` : `Priority: ${priority}`;

	return <Badge color={color} label={label} />;
});
