import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import App from './App';
import { ErrorBoundary } from './components/Common/ErrorBoundary';
import { store } from './store/store';
import { theme } from './theme/theme';

const rootElement = document.getElementById('root');
if (!rootElement) {
	throw new Error('Root element not found');
}

createRoot(rootElement).render(
	<StrictMode>
		<Provider store={store}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<ErrorBoundary>
					<App />
				</ErrorBoundary>
			</ThemeProvider>
		</Provider>
	</StrictMode>
);
