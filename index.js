import {fixupConfigRules} from '@eslint/compat';
import {FlatCompat} from '@eslint/eslintrc';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import securityPlugin from './plugins/security/index.js';
import globals from 'globals';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import {getConfig} from './helpers/config.js';


const flatCompat = new FlatCompat();

/**
 * Default config if no extensions override it.
 *
 */
const BASE_CONFIG = {
	languageOptions: {
		ecmaVersion: 7,
		globals: {
			...globals.browser,
			$: 'readonly',
			jQuery: 'readonly',
		},
		parser: tsParser,
		parserOptions: {
			project: './tsconfig.json',
			warnOnUnsupportedTypeScriptVersion: false,
		},
		sourceType: 'module',
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
		// Parse error with Svelte v4 due to `as` operator.
		'import/named': 'off',
		'import/no-unresolved': 'off',
		'no-console': [ 'warn', {allow: [ 'warn', 'error', 'debug' ]} ],
		'no-constant-binary-expression': [ 'warn' ],
		'no-multiple-empty-lines': [ 'error', {max: 2} ],
		'object-curly-spacing': [ 1, 'never' ],
		'react/no-unescaped-entities': [ 2, {forbid: [ '>', '}' ]} ],
		'react/display-name': 'off',
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/jsx-curly-spacing': [ 1, {
			when: 'never',
			allowMultiline: false,
			children: true,
		} ],
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
	settings: {
		react: {
			version: '18.0',
		},
	},
};


const TS_CONFIG = {
	files: [ '**/*.ts', '**/*.tsx' ],
	plugins: {
		'@typescript-eslint': tsPlugin,
		'@stylistic/ts': stylisticTs,
	},
	//Rules to override the standard JS ones when we get undesired results for TypeScript may be found here
	//@link https://typescript-eslint.io/rules/
	rules: {
		'jsdoc/no-undefined-types': 'off',
		'no-magic-numbers': 'off',
		'no-redeclare': 'off',
		'no-shadow': 'off',
		'no-undef': 'off',
		'no-unused-vars': 'off',
		semi: 'off',
		'@typescript-eslint/no-empty-object-type': 'warn',
		'@typescript-eslint/no-explicit-any': 'error',
		'@typescript-eslint/no-redeclare': [ 'error' ],
		'@typescript-eslint/no-restricted-types': [ 'error', {
			types: {
				unknown: 'Use a specific type.',
			},
		} ],
		'@typescript-eslint/no-shadow': [ 'error' ],
		'@typescript-eslint/no-unsafe-function-type': 'error',
		'@typescript-eslint/no-unused-vars': 'error',
		'@typescript-eslint/no-wrapper-object-types': 'error',
		'@typescript-eslint/strict-boolean-expressions': [ 'warn', {
			allowString: false, allowNumber: false,
		} ],
		'@stylistic/ts/type-annotation-spacing': [ 'warn', {
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
};

/**
 * Merge in any extensions' config.
 */
let mergedConfig = [ BASE_CONFIG, TS_CONFIG ];
try {
	mergedConfig = getConfig( mergedConfig );
} catch ( e ) {
	console.debug( e );
	// JS Boilerplate is not installed.
}

export default [
	...securityPlugin.configs.recommended,
	...fixupConfigRules( flatCompat.extends( 'plugin:@wordpress/eslint-plugin/recommended-with-formatting' ) ),
	...fixupConfigRules( flatCompat.extends( 'plugin:deprecation/recommended' ) ),
	...mergedConfig,
];
