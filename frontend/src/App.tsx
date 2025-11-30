import { Box, Container, Typography } from '@mui/material';

function App() {
	return (
		<Container maxWidth="lg">
			<Box sx={{ my: 4 }}>
				<Typography variant="h3" component="h1" gutterBottom>
					Task Queue Monitor
				</Typography>
				<Typography variant="body1" color="text.secondary">
					Frontend setup complete. Components to be implemented.
				</Typography>
			</Box>
		</Container>
	);
}

export default App;
