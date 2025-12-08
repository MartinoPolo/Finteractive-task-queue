import { Box, Container } from '@mui/material';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { selectError, setError } from '../../features/tasks/tasksSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { ErrorAlert } from '../Common/ErrorAlert';
import { Header } from './Header';

interface MainLayoutProps {
	children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
	const dispatch = useAppDispatch();
	const clearError = useCallback(() => dispatch(setError(null)), [dispatch]);

	const error = useAppSelector(selectError);
	return (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				minHeight: '100vh',
				backgroundColor: 'background.default'
			}}
		>
			<Header />
			<Container
				maxWidth="xl"
				sx={{
					display: 'flex',
					flexDirection: 'column',
					flex: 1,
					py: { xs: 2, sm: 3 },
					px: { xs: 2, sm: 3, md: 4 }
				}}
			>
				<ErrorAlert error={error} onClose={clearError} />
				{children}
			</Container>
		</Box>
	);
}
