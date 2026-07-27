import {adjustWordPressConfig} from '../../../helpers/wordpress';
import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';

describe( 'getWordPressConfig', () => {
	it( 'Swaps the TypeScript resolver for the node resolver', () => {
		const recommended: FlatConfig.Config[] = [ {
			settings: {
				'import/resolver': {
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ].settings?.[ 'import/resolver' ] ).toEqual( {
			node: {
				alwaysTryTypes: true,
			},
		} );
	} );


	it( 'Preserves other resolvers alongside the swapped TypeScript resolver', () => {
		const recommended: FlatConfig.Config[] = [ {
			settings: {
				'import/resolver': {
					node: {
						extensions: [ '.js' ],
					},
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ].settings?.[ 'import/resolver' ] ).toEqual( {
			node: {
				alwaysTryTypes: true,
			},
		} );
	} );


	it( 'Leaves entries without an `import/resolver` setting unchanged', () => {
		const recommended: FlatConfig.Config[] = [ {
			rules: {
				semi: 'error',
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ] ).toBe( recommended[ 0 ] );
	} );


	it( 'Leaves an `import/resolver` setting without `typescript` unchanged', () => {
		const recommended: FlatConfig.Config[] = [ {
			settings: {
				'import/resolver': {
					node: {
						extensions: [ '.js' ],
					},
				},
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ] ).toBe( recommended[ 0 ] );
	} );


	it( 'Leaves a non-object `import/resolver` setting unchanged', () => {
		const recommended: FlatConfig.Config[] = [ {
			settings: {
				'import/resolver': 'node',
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ] ).toBe( recommended[ 0 ] );
	} );


	it( 'Preserves the rest of the entry when swapping the resolver', () => {
		const recommended: FlatConfig.Config[] = [ {
			files: [ '**/*.js' ],
			rules: {
				semi: 'error',
			},
			settings: {
				'import/resolver': {
					typescript: {
						alwaysTryTypes: true,
					},
				},
			},
		} ];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ].files ).toEqual( [ '**/*.js' ] );
		expect( result[ 0 ].rules ).toEqual( {
			semi: 'error',
		} );
	} );


	it( 'Processes multiple entries independently', () => {
		const recommended: FlatConfig.Config[] = [
			{
				settings: {
					'import/resolver': {
						typescript: {
							alwaysTryTypes: true,
						},
					},
				},
			},
			{
				rules: {
					semi: 'error',
				},
			},
		];

		const result = adjustWordPressConfig( recommended );

		expect( result[ 0 ].settings?.[ 'import/resolver' ] ).toEqual( {
			node: {
				alwaysTryTypes: true,
			},
		} );
		expect( result[ 1 ] ).toBe( recommended[ 1 ] );
	} );


	it( 'Returns an empty array for an empty input', () => {
		expect( adjustWordPressConfig( [] ) ).toEqual( [] );
	} );
} );
