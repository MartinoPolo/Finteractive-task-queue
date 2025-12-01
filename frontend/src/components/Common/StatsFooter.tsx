import { Box, Typography } from '@mui/material';
import { selectCompleted, selectCurrentTaskId, selectQueue } from '../../features/tasks/tasksSlice';
import { useAppSelector } from '../../store/hooks';

export function StatsFooter() {
	const queue = useAppSelector(selectQueue);
	const completed = useAppSelector(selectCompleted);
	const currentTaskId = useAppSelector(selectCurrentTaskId);

	return (
		<Box sx={{ mt: 4, textAlign: 'center' }}>
			<Typography variant="body2">
				Active Tasks: {queue.length} | Completed Tasks: {completed.length} | Processing:{' '}
				{currentTaskId ? 'Yes' : 'No'}
			</Typography>
		</Box>
	);
}
