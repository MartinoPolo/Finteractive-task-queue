import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { useCallback } from 'react';
import {
	clearCompletedTasks,
	selectCompleted,
	selectIsClearingCompleted
} from '../../features/tasks/tasksSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/theme';
import { TaskCard } from '../Task/TaskCard';

export function CompletedList() {
	const dispatch = useAppDispatch();
	const clearCompleted = useCallback(() => dispatch(clearCompletedTasks()), [dispatch]);
	const tasks = useAppSelector(selectCompleted);
	const isClearing = useAppSelector(selectIsClearingCompleted);

	return (
		<Paper elevation={2} sx={{ p: 3 }}>
			<Box
				sx={{
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'space-between',
					mb: 2
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
					<CheckCircleIcon sx={{ color: colors.success.dark }} />
					<Typography variant="h6">Completed Tasks ({tasks.length})</Typography>
				</Box>
				{tasks.length > 0 && (
					<Button
						size="small"
						startIcon={<DeleteSweepIcon />}
						onClick={clearCompleted}
						disabled={isClearing}
						sx={{
							px: 1.5,
							whiteSpace: 'nowrap',
							color: isClearing ? 'text.disabled' : colors.danger.main,
							backgroundColor: isClearing ? colors.neutral.background.subtle : colors.danger.light,
							'&:hover': {
								backgroundColor: isClearing
									? colors.neutral.background.subtle
									: colors.danger.lighter
							}
						}}
					>
						{isClearing ? 'Clearing...' : 'Clear All'}
					</Button>
				)}
			</Box>
			<Divider sx={{ mb: 2 }} />
			{tasks.length > 0 ? (
				<Box sx={{ maxHeight: { xs: 250, md: 384 }, overflow: 'auto', pr: 0.5 }}>
					<Stack spacing={1.5}>
						{tasks.map((task) => (
							<TaskCard key={task.id} task={task} status="completed" />
						))}
					</Stack>
				</Box>
			) : (
				<Paper
					elevation={0}
					sx={{
						p: 3,
						backgroundColor: 'background.default',
						textAlign: 'center'
					}}
				>
					<Typography color="text.secondary">No completed tasks yet</Typography>
				</Paper>
			)}
		</Paper>
	);
}
