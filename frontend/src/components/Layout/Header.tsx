import AssignmentIcon from '@mui/icons-material/Assignment';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import { useAppSelector } from '../../store/hooks';
import { ConnectionStatus } from '../Common/ConnectionStatus';

export function Header() {
	const connectionStatus = useAppSelector((state) => state.tasks.connectionStatus);

	return (
		<AppBar
			position="static"
			sx={{
				backgroundColor: 'background.paper',
				color: 'text.primary'
			}}
		>
			<Toolbar sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
				<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexGrow: 1, minWidth: 0 }}>
					<AssignmentIcon sx={{ fontSize: 32, color: 'primary.main', flexShrink: 0 }} />
					<Typography variant="h5" component="h1" noWrap>
						Task Queue Monitor
					</Typography>
				</Box>
				<ConnectionStatus status={connectionStatus} />
			</Toolbar>
		</AppBar>
	);
}
