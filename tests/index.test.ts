let mockIncludeExtensions = true;

// Change the result of the getConfig function, so we can change the result during the test.
jest.mock( '../helpers/config.js', () => ( {
	...jest.requireActual( '../helpers/config.js' ),
	getConfig:  originalConfig => {
		if ( mockIncludeExtensions ) {
			return jest.requireActual( '../helpers/config.js' ).getConfig( originalConfig );
		}
		return originalConfig;
	}
} ) );


afterEach( () => {
	jest.resetModules();
	mockIncludeExtensions = true;
});


describe( 'index.js', () => {
	test( 'Snapshot', () => {
		expect( require( '../index.js' ) ).toMatchSnapshot();
	} );


	test( 'Parser Options', () => {
		expect( require( '../index.js' ).parserOptions ).toEqual( {
			ecmaVersion: 7,
			extraFileExtensions: [
				'.svelte',
			],
			project: "./tsconfig.json",
			sourceType: 'module',
			warnOnUnsupportedTypeScriptVersion: false,
		} );
	} );

	test( 'Overrides', () => {
		expect( require( '../index.js' ).overrides[ 1 ] ).toEqual( {
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
		expect( require( '../index.js' ) ).toMatchSnapshot( 'original config' );
		expect( require( '../index.js' ).overrides[ 1 ] ).not.toBeDefined();

		expect( require( '../index.js' ).parserOptions ).toEqual( {
			ecmaVersion: 7,
			project: "./tsconfig.json",
			sourceType: 'module',
			warnOnUnsupportedTypeScriptVersion: false,
		} );
	} );
} );
