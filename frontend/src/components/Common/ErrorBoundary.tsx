import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	handleReset = (): void => {
		this.setState({ hasError: false, error: null });
	};

	handleReload = (): void => {
		window.location.reload();
	};

	render(): ReactNode {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<Box
					sx={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						minHeight: '100vh',
						backgroundColor: 'background.default',
						p: 3
					}}
				>
					<Paper
						elevation={3}
						sx={{
							p: 4,
							maxWidth: 500,
							textAlign: 'center'
						}}
					>
						<ReportProblemIcon
							sx={{
								fontSize: 64,
								color: 'error.main',
								mb: 2
							}}
						/>
						<Typography variant="h5" gutterBottom>
							Something went wrong
						</Typography>
						<Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
							An unexpected error occurred. Please try again or reload the page.
						</Typography>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<Paper
								elevation={0}
								sx={{
									p: 2,
									mb: 3,
									backgroundColor: 'grey.100',
									textAlign: 'left',
									overflow: 'auto',
									maxHeight: 150
								}}
							>
								<Typography
									variant="caption"
									component="pre"
									sx={{ fontFamily: 'monospace', m: 0 }}
								>
									{this.state.error.message}
								</Typography>
							</Paper>
						)}
						<Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
							<Button variant="outlined" onClick={this.handleReset}>
								Try Again
							</Button>
							<Button variant="contained" onClick={this.handleReload}>
								Reload Page
							</Button>
						</Box>
					</Paper>
				</Box>
			);
		}

		return this.props.children;
	}
}
