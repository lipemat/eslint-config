const {getConfig} = require( './helpers/config' );
let mergedConfig  =  {
	"env": {
		"browser": true
	},
	'extends': [
		'plugin:@wordpress/eslint-plugin/recommended-with-formatting',
		'plugin:import/typescript'
	],
	'globals': {
		'$': 'readonly',
		'jQuery': 'readonly',
	},
	'overrides': [ {
		'files': [ '**/*.ts', '**/*.tsx' ],
		'plugins': [
			'@typescript-eslint',
		],
		//Rules to override the standard JS ones when we get undesired results for TypeScript may be found here
		//@link https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#supported-rules
		'rules': {
			'jsdoc/no-undefined-types': [ 0 ],
			'no-magic-numbers': [ 0 ],
			"no-redeclare": [ 0 ],
			"no-shadow": [ 0 ],
			'no-undef': [ 0 ],
			'semi': [ 0 ],
			"@typescript-eslint/no-shadow": [ "error" ],
			"@typescript-eslint/no-redeclare": [ "error" ],
			'@typescript-eslint/no-unused-vars': 'error',
			"@typescript-eslint/strict-boolean-expressions": [
				"warn",
				{
					"allowString": false,
					"allowNumber": false
				}
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
	'parser': '@typescript-eslint/parser',
	'parserOptions': {
		'ecmaVersion': 7,
		'project': './tsconfig.json',
		'sourceType': 'module',
		'warnOnUnsupportedTypeScriptVersion': false,
	},
	'rules': {
		'arrow-parens': [ 1, 'as-needed' ],
		'arrow-spacing': [ 1, {'before': true, 'after': true} ],
		'camelcase': [ 2, {'properties': 'never'} ],
		'indent': [ 1, 'tab', {'SwitchCase': 1} ],
		'lines-around-comment': [ 0 ],
		'jsdoc/require-param': [ 0 ],
		'jsdoc/require-param-type': [ 0 ],
		'jsdoc/require-returns-description': [ 0 ],
		'jsdoc/check-tag-names': [ 1, {'definedTags': [ 'notice', 'link', 'task', 'ticket', 'note' ]} ],

		/**
		 * Disable rule until the bug is resolved.
		 *
		 * @link https://github.com/import-js/eslint-plugin-import/issues/2267
		 */
		"import/no-unresolved": [ 0 ],

		'no-console': [ 0 ],
		'no-multiple-empty-lines': [ 'error', {max: 2} ],
		'object-curly-spacing': [ 1, 'never' ],
		'react/no-unescaped-entities': [ 2, {'forbid': [ '>', '}' ]} ],
		'react/display-name': [ 0 ],
		'react-hooks/rules-of-hooks': 'error',
		'react-hooks/exhaustive-deps': 'warn',
		'react/jsx-curly-spacing': [ 1, {'when': 'never', 'allowMultiline': false, children: true} ],
		'react/prop-types': [ 2, {'skipUndeclared': true} ],
		'space-before-blocks': [ 1, 'always' ],
		'space-before-function-paren': [ 'error', {
			anonymous: 'never',
			named: 'never',
			asyncArrow: 'ignore',
		} ],
		'space-in-parens': [ 2, 'always' ],
		'template-curly-spacing': [ 1, 'never' ],
		'yoda': [ 2, 'always', {'onlyEquality': true} ],
	},
	'settings': {
		'react': {
			'version': '18.0',
		},
	},
};

/**
 * Merge in any extensions' config.
 */
try {
	mergedConfig = getConfig( mergedConfig );
} catch( e ) {
	// JS Boilerplate is not installed.
}

module.exports = mergedConfig;
