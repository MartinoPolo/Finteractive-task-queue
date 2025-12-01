import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import { Box, Divider, Paper, Stack, Typography } from '@mui/material';
import { selectPendingTasks } from '../../features/tasks/tasksSlice';
import { useAppSelector } from '../../store/hooks';
import { TaskCard } from '../Task/TaskCard';

export function QueueList() {
	const pendingTasks = useAppSelector(selectPendingTasks);

	return (
		<Paper elevation={2} sx={{ p: 3, height: '100%' }}>
			<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
				<FormatListBulletedIcon sx={{ color: 'text.secondary' }} />
				<Typography variant="h6">Queue ({pendingTasks.length} tasks)</Typography>
			</Box>
			<Divider sx={{ mb: 2 }} />
			{pendingTasks.length > 0 ? (
				<Box sx={{ maxHeight: { xs: 300, md: 400 }, overflow: 'auto', pr: 0.5 }}>
					<Stack spacing={1.5}>
						{pendingTasks.map((task) => (
							<TaskCard key={task.id} task={task} status="queued" />
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
					<Typography color="text.secondary">Queue is empty</Typography>
				</Paper>
			)}
		</Paper>
	);
}
