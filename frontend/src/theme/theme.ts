import { createTheme, type ThemeOptions } from '@mui/material';

/**
 * Consolidated color palette for the application
 */
export const colors = {
	// Primary brand colors
	primary: {
		main: '#2563eb',
		dark: '#1d4ed8',
		darker: '#1e40af',
		light: '#dbeafe',
		contrastText: '#ffffff'
	},
	// Status colors
	status: {
		connected: '#22c55e',
		connecting: '#f59e0b',
		disconnected: '#ef4444',
		error: '#ef4444'
	},
	// Priority colors
	priority: {
		critical: '#ef4444', // 8-10
		high: '#f97316', // 5-7
		medium: '#eab308', // 3-4
		low: '#22c55e' // 1-2
	},
	// Neutral colors
	neutral: {
		text: {
			primary: '#1f2937',
			secondary: '#4b5563',
			muted: '#6b7280',
			disabled: '#9ca3af'
		},
		background: {
			default: '#f3f4f6',
			paper: '#ffffff',
			subtle: '#e5e7eb'
		},
		border: {
			light: '#e5e7eb',
			main: '#d1d5db'
		}
	},
	// Success/completion
	success: {
		main: '#22c55e',
		light: '#bbf7d0',
		dark: '#16a34a'
	},
	// Error/danger
	danger: {
		main: '#dc2626',
		light: '#fee2e2',
		lighter: '#fecaca'
	},
	// Shadows
	shadow: {
		primary: 'rgba(37, 99, 235, 0.25)',
		subtle: 'rgba(0, 0, 0, 0.06)'
	}
} as const;

/**
 * Common border radius values
 */
export const borderRadius = {
	none: 0,
	sm: 4,
	md: 8,
	lg: 12,
	xl: 16,
	full: 9999
} as const;

/**
 * Common spacing values (in theme spacing units)
 */
export const spacing = {
	xs: 1,
	sm: 2,
	md: 3,
	lg: 4,
	xl: 6
} as const;

/**
 * Theme options configuration
 */
const themeOptions: ThemeOptions = {
	palette: {
		mode: 'light',
		primary: {
			main: colors.primary.main,
			dark: colors.primary.dark,
			light: colors.primary.light,
			contrastText: colors.primary.contrastText
		},
		secondary: {
			main: colors.priority.high
		},
		success: {
			main: colors.success.main,
			light: colors.success.light,
			dark: colors.success.dark
		},
		warning: {
			main: colors.priority.medium
		},
		error: {
			main: colors.priority.critical
		},
		text: {
			primary: colors.neutral.text.primary,
			secondary: colors.neutral.text.secondary,
			disabled: colors.neutral.text.disabled
		},
		background: {
			default: colors.neutral.background.default,
			paper: colors.neutral.background.paper
		},
		divider: colors.neutral.border.light
	},
	typography: {
		fontWeightMedium: 500,
		fontWeightBold: 700,
		h5: {
			fontWeight: 700,
			color: colors.neutral.text.primary
		},
		h6: {
			fontWeight: 700,
			color: colors.neutral.text.primary
		},
		subtitle1: {
			fontWeight: 600,
			color: colors.neutral.text.primary
		},
		body2: {
			color: colors.neutral.text.secondary
		},
		caption: {
			color: colors.neutral.text.muted
		}
	},
	shape: {
		borderRadius: borderRadius.md
	},
	components: {
		MuiAppBar: {
			styleOverrides: {
				root: {
					borderRadius: 0
				}
			},
			defaultProps: {
				elevation: 2
			}
		},
		MuiCard: {
			styleOverrides: {
				root: {
					borderRadius: borderRadius.md
				}
			}
		},
		MuiPaper: {
			styleOverrides: {
				root: {
					borderRadius: borderRadius.md
				}
			}
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: borderRadius.md,
					textTransform: 'none',
					fontWeight: 500
				},
				contained: {
					'&:hover': {
						backgroundColor: colors.primary.dark
					},
					'&:active': {
						backgroundColor: colors.primary.darker
					}
				}
			}
		},
		MuiTextField: {
			styleOverrides: {
				root: {
					'& .MuiOutlinedInput-root': {
						borderRadius: borderRadius.md,
						'&:hover fieldset': {
							borderColor: colors.primary.main
						},
						'&.Mui-focused fieldset': {
							borderColor: colors.primary.main
						}
					}
				}
			}
		},
		MuiLinearProgress: {
			styleOverrides: {
				root: {
					borderRadius: borderRadius.lg,
					backgroundColor: colors.neutral.background.subtle
				},
				bar: {
					borderRadius: borderRadius.lg
				}
			}
		},
		MuiChip: {
			styleOverrides: {
				root: {
					fontWeight: 500
				}
			}
		}
	}
};

export const theme = createTheme(themeOptions);

/**
 * Helper function to get priority color
 */
export function getPriorityColor(priority: number): string {
	if (priority >= 8) {
		return colors.priority.critical;
	}
	if (priority >= 5) {
		return colors.priority.high;
	}
	if (priority >= 3) {
		return colors.priority.medium;
	}
	return colors.priority.low;
}

/**
 * Helper function to get priority label
 */
export function getPriorityLabel(priority: number): string {
	if (priority >= 8) {
		return 'Critical';
	}
	if (priority >= 5) {
		return 'High';
	}
	if (priority >= 3) {
		return 'Medium';
	}
	return 'Low';
}

/**
 * Helper function to get connection status config
 */
export function getConnectionStatusConfig(
	status: 'connected' | 'connecting' | 'disconnected' | 'error'
) {
	const configs = {
		connected: { label: 'Connected', color: colors.status.connected },
		connecting: { label: 'Connecting...', color: colors.status.connecting },
		disconnected: { label: 'Disconnected', color: colors.status.disconnected },
		error: { label: 'Connection Error', color: colors.status.error }
	};
	return configs[status];
}

/**
 * Common keyframe animations
 */
export const animations = {
	pulse: {
		'@keyframes pulse': {
			'0%, 100%': { opacity: 1 },
			'50%': { opacity: 0.5 }
		}
	},
	pulseSlow: {
		'@keyframes pulse-slow': {
			'0%, 100%': { boxShadow: `0 0 0 4px rgba(59, 130, 246, 0.2)` },
			'50%': { boxShadow: `0 0 0 8px rgba(59, 130, 246, 0.1)` }
		}
	}
} as const;
