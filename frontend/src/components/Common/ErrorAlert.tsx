import CloseIcon from '@mui/icons-material/Close';
import { Alert, AlertTitle, Collapse, IconButton } from '@mui/material';
import { memo } from 'react';

interface ErrorAlertProps {
	error: string | null;
	onClose?: () => void;
	title?: string;
	severity?: 'error' | 'warning' | 'info';
}

export const ErrorAlert = memo(function ErrorAlert({
	error,
	onClose,
	title = 'Error',
	severity = 'error'
}: ErrorAlertProps) {
	return (
		<Collapse in={!!error}>
			<Alert
				severity={severity}
				action={
					onClose ? (
						<IconButton aria-label="close" color="inherit" size="small" onClick={onClose}>
							<CloseIcon fontSize="inherit" />
						</IconButton>
					) : undefined
				}
				sx={{ mb: 2 }}
			>
				<AlertTitle>{title}</AlertTitle>
				{error}
			</Alert>
		</Collapse>
	);
});
