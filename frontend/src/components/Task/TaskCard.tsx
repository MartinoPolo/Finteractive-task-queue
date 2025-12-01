import { Box, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { memo } from 'react';
import { animations, colors } from '../../theme/theme';
import type { CompletedTask, Task } from '../../types/task';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

export type TaskStatus = 'queued' | 'processing' | 'completed';

interface TaskCardProps {
	task: Task | CompletedTask;
	status?: TaskStatus;
}

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return date.toLocaleString('en-US', {
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit'
	});
}

function getProgressBarColor(status: TaskStatus): string {
	switch (status) {
		case 'completed':
			return colors.success.main;
		case 'processing':
			return colors.primary.main;
		case 'queued':
		default:
			return colors.neutral.text.disabled;
	}
}

function TaskCardComponent({ task, status = 'queued' }: TaskCardProps) {
	const isProcessing = status === 'processing';
	const isCompleted = status === 'completed';
	const completedTask = isCompleted ? (task as CompletedTask) : null;

	return (
		<Paper
			elevation={0}
			sx={{
				p: 2,
				border: isProcessing
					? `2px solid ${colors.primary.main}`
					: `1px solid ${colors.neutral.border.main}`,
				transition: 'all 0.3s ease',
				boxShadow: isProcessing
					? `0 4px 12px ${colors.shadow.primary}`
					: `0 2px 6px ${colors.shadow.subtle}`,
				animation: isProcessing ? 'pulse-slow 2s ease-in-out infinite' : undefined,
				...animations.pulseSlow
			}}
		>
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'flex-start',
					mb: 1.5,
					gap: 1
				}}
			>
				<Box sx={{ flex: 1, minWidth: 0 }}>
					<Typography
						variant="subtitle1"
						sx={{ fontSize: '1rem', fontWeight: 600 }}
						noWrap
						title={task.name}
					>
						{task.name}
					</Typography>
					<Typography variant="caption" sx={{ color: 'text.disabled' }}>
						ID: {task.id.slice(0, 8)}...
					</Typography>
				</Box>
				<Stack direction="row" spacing={1} alignItems="center">
					<StatusBadge status={status} />
					<PriorityBadge priority={task.priority} />
				</Stack>
			</Box>

			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					mb: 0.5
				}}
			>
				<Typography variant="caption" sx={{ color: 'text.secondary' }}>
					Created: {formatDate(task.createdAt)}
				</Typography>
				{isCompleted && completedTask ? (
					<Typography variant="caption" sx={{ color: colors.success.dark, fontWeight: 500 }}>
						Completed: {formatDate(completedTask.completedAt)}
					</Typography>
				) : (
					<Typography
						variant="caption"
						sx={{
							color: isProcessing ? colors.primary.main : 'text.secondary',
							fontWeight: isProcessing ? 500 : 400
						}}
					>
						{task.progress}%
					</Typography>
				)}
			</Box>

			<LinearProgress
				variant="determinate"
				value={isCompleted ? 100 : task.progress}
				sx={{
					height: 10,
					borderRadius: 1,
					backgroundColor: colors.neutral.background.subtle,
					'& .MuiLinearProgress-bar': {
						backgroundColor: getProgressBarColor(status),
						transition: 'transform 0.5s ease-out'
					}
				}}
			/>
		</Paper>
	);
}

export const TaskCard = memo(TaskCardComponent);
