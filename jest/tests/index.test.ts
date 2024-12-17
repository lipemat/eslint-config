let mockIncludeExtensions = true;

// Change the result of the getConfig function, so we can change the result during the test.
jest.mock( '../../helpers/config.js', () => ( {
	...jest.requireActual( '../../helpers/config.js' ),
	getConfig: originalConfig => {
		if ( mockIncludeExtensions ) {
			return jest.requireActual( '../../helpers/config.js' ).getConfig( originalConfig );
		}
		return originalConfig;
	},
} ) );


afterEach( () => {
	jest.resetModules();
	mockIncludeExtensions = true;
} );


describe( 'index.js', () => {
	test( 'Parser Options', () => {
		const config = require( '../../index.js' );
		const original = config.default[ config.default.length - 3 ];
		const override = config.default[ config.default.length - 2 ]

		expect( original.languageOptions.sourceType ).toEqual( 'module' );
		expect( original.languageOptions.ecmaVersion ).toEqual( 7 );
		expect( original.languageOptions.parserOptions ).toEqual( {
			project: './tsconfig.json',
			warnOnUnsupportedTypeScriptVersion: false,
		} );

		expect( override.languageOptions.sourceType ).not.toBeDefined();
		expect( override.languageOptions.ecmaVersion ).not.toBeDefined();
		expect( override.languageOptions.parserOptions ).toEqual( {
			extraFileExtensions: [
				'.svelte',
			],
		} );
	} );


	test( 'Overrides', () => {
		const config = require( '../../index.js' );
		const override = config.default[ config.default.length - 1 ];

		expect( override ).toEqual( {
			files: [
				'*.svelte',
			],
			extends: [
				'plugin:svelte/recommended',
			],
			parser: 'svelte-eslint-parser',
			parserOptions: {
				parser: '@typescript-eslint/parser',
			},
			rules: {
				'prefer-const': [
					0,
				],
			},
		} );
	} );


	test( 'Original Config', () => {
		mockIncludeExtensions = false;
		const config = require( '../../index.js' );
		const original = config.default[ config.default.length - 2 ]

		expect( original.languageOptions.sourceType ).toEqual( 'module' );
		expect( original.languageOptions.ecmaVersion ).toEqual( 7 );
		expect( original.languageOptions.parserOptions ).toEqual( {
			project: './tsconfig.json',
			warnOnUnsupportedTypeScriptVersion: false,
		} );
	} );
} );
