import type { ReactNode } from 'react';

interface MainLayoutProps {
	children: ReactNode;
}

// export function MainLayout({ children }: MainLayoutProps) {
// 	const dispatch = useAppDispatch();
// 	const clearError = useCallback(() => dispatch(setError(null)), [dispatch]);
//
// 	const error = useAppSelector(selectError);
// 	return (
// 		<Box
// 			sx={{
// 				display: 'flex',
// 				flexDirection: 'column',
// 				minHeight: '100vh',
// 				backgroundColor: 'background.default'
// 			}}
// 		>
// 			<Header />
// 			<Container
// 				maxWidth="xl"
// 				sx={{
// 					display: 'flex',
// 					flexDirection: 'column',
// 					flex: 1,
// 					py: { xs: 2, sm: 3 },
// 					px: { xs: 2, sm: 3, md: 4 }
// 				}}
// 			>
// 				<ErrorAlert error={error} onClose={clearError} />
// 				{children}
// 			</Container>
// 		</Box>
// 	);
// }
