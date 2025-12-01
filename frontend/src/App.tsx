import { Box, Grid } from '@mui/material';
import { StatsFooter } from './components/Common/StatsFooter';
import { MainLayout } from './components/Layout/MainLayout';
import { CompletedList } from './components/Queue/CompletedList';
import { CurrentTask } from './components/Queue/CurrentTask';
import { QueueList } from './components/Queue/QueueList';
import { TaskForm } from './components/Task/TaskForm';
import { useSocket } from './hooks/useSocket';

function App() {
	useSocket();

	return (
		<MainLayout>
			<Box sx={{ mb: 4 }}>
				<TaskForm />
			</Box>

			<CurrentTask />

			<Grid container spacing={3}>
				<Grid size={{ xs: 12, lg: 6 }}>
					<QueueList />
				</Grid>

				<Grid size={{ xs: 12, lg: 6 }}>
					<CompletedList />
				</Grid>
			</Grid>

			<StatsFooter />
		</MainLayout>
	);
}

export default App;
