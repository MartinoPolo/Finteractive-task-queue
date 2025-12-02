import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { selectCurrentTask } from '../../features/tasks/tasksSlice';
import { useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/theme';
import { TaskCard } from '../Task/TaskCard';

export function CurrentTask() {
	const task = useAppSelector(selectCurrentTask);
	return (
		<Paper elevation={2} sx={{ p: 3 }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						position: 'relative'
					}}
				>
					<PlayCircleOutlineIcon sx={{ color: colors.primary.main }} />
				</Box>
				<Typography variant="h6">Currently Processing</Typography>
			</Box>
			<Divider sx={{ mb: 2 }} />
			{task ? (
				<TaskCard task={task} status="processing" />
			) : (
				<Paper
					elevation={0}
					sx={{
						p: 3,
						backgroundColor: 'background.default',
						textAlign: 'center'
					}}
				>
					<Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>
						No task currently processing
					</Typography>
					<Typography sx={{ color: 'text.disabled', fontSize: '0.875rem', mt: 0.5 }}>
						Add tasks to the queue to start processing
					</Typography>
				</Paper>
			)}
		</Paper>
	);
}
