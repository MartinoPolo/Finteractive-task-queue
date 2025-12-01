import AddIcon from '@mui/icons-material/Add';
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Paper,
	Stack,
	TextField,
	Typography
} from '@mui/material';
import { useCallback, useState } from 'react';
import { createTask, selectIsCreatingTask } from '../../features/tasks/tasksSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { colors } from '../../theme/theme';
import { addTaskSchema } from '../../types/task';

const priorityLegend = [
	{ label: 'Critical (8-10)', color: colors.priority.critical },
	{ label: 'High (5-7)', color: colors.priority.high },
	{ label: 'Medium (3-4)', color: colors.priority.medium },
	{ label: 'Low (1-2)', color: colors.priority.low }
];

export function TaskForm() {
	const dispatch = useAppDispatch();
	const isCreatingTask = useAppSelector(selectIsCreatingTask);

	const [name, setName] = useState('');
	const [priority, setPriority] = useState(5);
	const [formError, setFormError] = useState<string | null>(null);

	const handleSubmit = useCallback(
		async (e: React.FormEvent) => {
			e.preventDefault();
			setFormError(null);

			const result = addTaskSchema.safeParse({ name, priority });
			if (!result.success) {
				const messages = result.error.issues.map((issue) => issue.message);
				setFormError(messages.join('. '));
				return;
			}

			try {
				await dispatch(createTask(result.data)).unwrap();
				setName('');
				setPriority(5);
			} catch {
				setFormError('Failed to add task. Please try again.');
			}
		},
		[name, priority, dispatch]
	);

	const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setName(e.target.value);
		setFormError(null);
	}, []);

	const handlePriorityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number(e.target.value) || 1;
		setPriority(Math.min(10, Math.max(1, value)));
	}, []);

	return (
		<Paper elevation={2} sx={{ p: 3 }}>
			<Typography variant="h6" sx={{ mb: 2 }}>
				Add New Task
			</Typography>

			{formError && (
				<Alert severity="error" sx={{ mb: 2 }}>
					{formError}
				</Alert>
			)}

			<Box component="form" onSubmit={handleSubmit}>
				<Box
					sx={{
						display: 'grid',
						gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' },
						gap: 2,
						mb: 2
					}}
				>
					<Box>
						<Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium', mb: 0.5 }}>
							Task Name
						</Typography>
						<TextField
							value={name}
							onChange={handleNameChange}
							fullWidth
							size="small"
							disabled={isCreatingTask}
							placeholder="Enter task name..."
						/>
					</Box>

					<Box>
						<Typography variant="body2" sx={{ fontWeight: 'fontWeightMedium', mb: 0.5 }}>
							Priority (1-10)
						</Typography>
						<TextField
							type="number"
							value={priority}
							onChange={handlePriorityChange}
							fullWidth
							size="small"
							disabled={isCreatingTask}
							slotProps={{
								htmlInput: { min: 1, max: 10 }
							}}
						/>
					</Box>
				</Box>
				<Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
					{priorityLegend.map(({ label, color }) => (
						<Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
							<Box
								sx={{
									width: 12,
									height: 12,
									borderRadius: '50%',
									backgroundColor: color
								}}
							/>
							<Typography variant="caption">{label}</Typography>
						</Box>
					))}
				</Stack>
				<Button
					type="submit"
					variant="contained"
					startIcon={isCreatingTask ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
					disabled={isCreatingTask || !name.trim()}
					sx={{
						px: 3,
						py: 1,
						'&.Mui-disabled': {
							backgroundColor: colors.neutral.text.disabled,
							color: colors.primary.contrastText
						}
					}}
				>
					{isCreatingTask ? 'Adding...' : 'Add Task'}
				</Button>
			</Box>
		</Paper>
	);
}
