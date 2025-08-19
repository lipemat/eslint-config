import noUnsafeValue from './rules/no-unsafe-value.js';

const plugin = {
	meta: {
		name: '@lipemat/eslint-plugin-security',
		description: 'Security-related rules for TypeScript.',
		namespace: '@lipemat/security',
	},
	configs: {},
	rules: {
		'no-unsafe-value': noUnsafeValue.rules[ 'no-unsafe-value' ],
	},
};

Object.assign( plugin.configs, {
	recommended: [
		{
			plugins: {
				'@lipemat/security': plugin,
			},
			rules: {
				'@lipemat/security/no-unsafe-value': 'error',
			},
		},
	],
} );


export default plugin;
