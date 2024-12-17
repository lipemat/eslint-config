import * as tsParser from '@typescript-eslint/parser';
import getEslintConfig from '../helpers/eslint-config';

let mockUseGetConfig = true;
let mockIncludeExtensions = true;

// Change the result of the getConfig function, so we can change the result during the test.
jest.mock( '../../helpers/config.js', () => ( {
	...jest.requireActual( '../../helpers/config.js' ),
	getConfig: originalConfig => {
		if ( mockUseGetConfig ) {
			return jest.requireActual( '../../helpers/config.js' ).getConfig( originalConfig );
		}
		return originalConfig;
	},
} ) );


jest.mock( '@lipemat/js-boilerplate/helpers/config.js', () => ( {
	...jest.requireActual( '@lipemat/js-boilerplate/helpers/config.js' ),
	getExtensionsConfig: originalConfig => {
		if ( mockIncludeExtensions ) {
			return jest.requireActual( '@lipemat/js-boilerplate/helpers/config.js' ).getExtensionsConfig( originalConfig );
		}
		// Default result if no extensions are included.
		return {};
	},
} ) );


afterEach( () => {
	jest.resetModules();
	mockUseGetConfig = true;
	mockIncludeExtensions = true;
} );


describe( 'index.js', () => {
	test( 'Parser Options', () => {
		const config = require( '../../index.js' );
		const original = config.default[ config.default.length - 6 ];
		const svelte = config.default[ config.default.length - 1 ];

		expect( original.languageOptions.sourceType ).toEqual( 'module' );
		expect( original.languageOptions.ecmaVersion ).toEqual( 7 );
		expect( original.languageOptions.parserOptions ).toEqual( {
			extraFileExtensions: [
				'.svelte',
			],
			project: './tsconfig.json',
			warnOnUnsupportedTypeScriptVersion: false,
		} );

		expect( svelte.languageOptions.sourceType ).not.toBeDefined();
		expect( svelte.languageOptions.ecmaVersion ).not.toBeDefined();
		expect( original.languageOptions.parserOptions.extraFileExtensions ).toEqual( [
			'.svelte',
		] );
	} );


	test( 'Svelte config added as override', () => {
		const config = require( '../../index.js' );
		const svelteConfig = config.default[ config.default.length - 1 ];

		expect( svelteConfig.files ).toEqual( [
			'**/*.svelte',
			'*.svelte',
		] );

		expect( JSON.stringify( svelteConfig.languageOptions.parserOptions.parser ) ).toEqual( JSON.stringify( tsParser ) );
		expect( svelteConfig.rules ).toEqual( {
			'no-unused-vars': [
				0,
			],
			'prefer-const': [
				0,
			],
		} );
	} );


	test( 'Original Config', () => {
		mockUseGetConfig = false;
		const config = require( '../../index.js' );
		const original = config.default[ config.default.length - 2 ]

		expect( original.languageOptions.sourceType ).toEqual( 'module' );
		expect( original.languageOptions.ecmaVersion ).toEqual( 7 );
		expect( original.languageOptions.parserOptions ).toEqual( {
			project: './tsconfig.json',
			warnOnUnsupportedTypeScriptVersion: false,
		} );
	} );


	test( 'No extensions loaded', () => {
		mockIncludeExtensions = false;
		const config = require( '../../index.js' );
		expect( config.default.length ).toEqual( 18 );
	} );


	test( 'Enabled Rules', async () => {
		const config = await getEslintConfig();
		expect( config.rules ).toMatchSnapshot();
	} );
} );
