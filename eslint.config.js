import prettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

export default defineConfig(
	...ts.configs.recommended,
	prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node }
		},
		rules: {
			// === Base JavaScript Rules ===
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',
			// Enforce strict equality (use === instead of ==, except for smart cases like null checks)
			eqeqeq: ['error', 'smart'],
			// Prefer object shorthand syntax ({ x } instead of { x: x })
			'object-shorthand': 'warn',
			// Allow double boolean casting (!!value is common pattern)
			'no-extra-boolean-cast': 'off',
			// Require curly braces for all control statements
			curly: ['warn', 'all'],
			// Restrict usage of certain global variables
			'no-restricted-globals': [
				'warn',
				{
					name: 'parseInt',
					message: 'Use Number(...) instead, parseInt can have unexpected behavior.'
				},
				{
					name: 'isNaN',
					message: "Use Number.isNaN instead, which doesn't coerce the input."
				}
			]
		}
	},
	{
		name: 'typescript-rules',
		languageOptions: {
			parserOptions: {
				projectService: true,
				// Allow linting of config files not in tsconfig
				allowDefaultProject: ['*.config.js', '*.config.ts'],
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			// === TypeScript-specific Rules ===
			// Disable some default rules that are too strict or conflict
			'@typescript-eslint/no-unused-expressions': 'off',
			'@typescript-eslint/no-empty-object-type': 'off',

			// Warn about floating promises (async functions not awaited)
			'@typescript-eslint/no-floating-promises': 'warn',
			// Warn when awaiting non-thenable values
			'@typescript-eslint/await-thenable': 'warn',
			// Warn about unnecessary conditions (always true/false)
			'@typescript-eslint/no-unnecessary-condition': [
				'warn',
				{
					allowConstantLoopConditions: true
				}
			],
			// Warn about unused variables with some exceptions
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					destructuredArrayIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					argsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/require-array-sort-compare': 'error',
			// Disallow non-null assertions (use proper type guards instead)
			'@typescript-eslint/no-non-null-assertion': 'error',
			// Ensure switch statements are exhaustive for unions
			'@typescript-eslint/switch-exhaustiveness-check': [
				'error',
				{
					considerDefaultExhaustiveForUnions: true
				}
			],
			// Prefer 'type' over 'interface' consistently
			'@typescript-eslint/consistent-type-definitions': 'warn',
			// Enforce consistent type imports (inline style)
			'@typescript-eslint/consistent-type-imports': ['warn', { fixStyle: 'inline-type-imports' }],
			// Avoid separate type import side effects
			'@typescript-eslint/no-import-type-side-effects': 'warn',
			// Warn about duplicate types in unions/intersections
			'@typescript-eslint/no-duplicate-type-constituents': 'warn'
		}
	},
	// React-specific rules (only for frontend files)
	{
		name: 'react-rules',
		files: ['frontend/src/**/*.{ts,tsx}'],
		plugins: {
			'react-hooks': reactHooks,
			'react-refresh': reactRefresh
		},
		rules: {
			...reactHooks.configs.recommended.rules,
			'react-refresh/only-export-components': ['warn', { allowConstantExport: true }]
		}
	}
);
