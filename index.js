/**
 * Default config if no extensions override it.
 *
 */
let mergedConfig = {
	env: {
		browser: true,
	},
	extends: [
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:import/typescript',
		'plugin:deprecation/recommended',
	],
	globals: {
		$: 'readonly',
		jQuery: 'readonly',
	},
	overrides: [ {
		files: [ '**/*.ts', '**/*.tsx' ],
		plugins: [
			'@typescript-eslint',
		],
		//Rules to override the standard JS ones when we get undesired results for TypeScript may be found here
		//@link https://typescript-eslint.io/rules/
		rules: {
			'jsdoc/no-undefined-types': 'off',
			'no-magic-numbers': 'off',
			'no-redeclare': 'off',
			'no-shadow': 'off',
			'no-undef': 'off',
			semi: 'off',
			'@typescript-eslint/ban-types': [
				'error',
				{
					types: {
						unknown: 'Use a specific type.',
					},
				},
			],
			'@typescript-eslint/no-explicit-any': 'error',
			'@typescript-eslint/no-shadow': [ 'error' ],
			'@typescript-eslint/no-redeclare': [ 'error' ],
			'@typescript-eslint/no-unused-vars': 'error',
			'@typescript-eslint/strict-boolean-expressions': [
				'warn',
				{
					allowString: false,
					allowNumber: false,
				},
			],
			'@typescript-eslint/type-annotation-spacing': [ 'warn', {
				before: false,
				after: true,
				overrides: {
					arrow: {
						before: true,
						after: true,
					},
				},
			} ],
		},
	} ],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		ecmaVersion: 7,
		project: './tsconfig.json',
		sourceType: 'module',
		warnOnUnsupportedTypeScriptVersion: false,
	},
	rules: {
		'arrow-parens': [ 1, 'as-needed' ],
		'arrow-spacing': [ 1, {before: true, after: true} ],
		camelcase: [ 2, {properties: 'never'} ],
		indent: [ 1, 'tab', {SwitchCase: 1} ],
		'lines-around-comment': 'off',
		'jsdoc/require-param': 'off',
		'jsdoc/require-param-type': 'off',
		'jsdoc/require-returns-description': 'off',
		'jsdoc/check-tag-names': [ 1, {definedTags: [ 'notice', 'link', 'task', 'ticket', 'note' ]} ],

		/**
		 * Disable rule until the bug is resolved.
		 *
		 * @link https://github.com/import-js/eslint-plugin-import/issues/2267
		 */
		'import/no-unresolved': 'off',

		'no-console': [ 'warn', {allow: [ 'warn', 'error', 'debug' ]} ],
		'no-constant-binary-expression': [ 'warn' ],
		'no-multiple-empty-lines': [ 'error', {max: 2} ],
		'object-curly-spacing': [ 1, 'never' ],
		'react/no-unescaped-entities': [ 2, {forbid: [ '>', '}' ]} ],
		'react/display-name': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/jsx-curly-spacing': [ 1, {when: 'never', allowMultiline: false, children: true} ],
		'react/prop-types': [ 2, {skipUndeclared: true} ],
		'space-before-blocks': [ 1, 'always' ],
		'space-before-function-paren': [ 'error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'ignore',
		} ],
		'space-in-parens': [ 2, 'always' ],
		'template-curly-spacing': [ 1, 'never' ],
		yoda: [ 2, 'always', {onlyEquality: true} ],
	},
	root: true,
	settings: {
		react: {
			version: '18.0',
		},
	},
};

/**
 * Merge in any extensions' config.
 */
try {
	const {getConfig} = require( './helpers/config' );
	mergedConfig = getConfig( mergedConfig );
} catch ( e ) {
	// JS Boilerplate is not installed.
}

module.exports = mergedConfig;
