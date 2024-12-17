import jestRunnerEslint from '../../jest/helpers/jest-runner-eslint';

describe( 'Svelte rules are enabled', () => {
	test( 'svelte/no-dupe-style-properties', async () => {
		expect( await jestRunnerEslint( 'failing/svelte/no-dupe-style-properties' ) ).toMatchSnapshot();
	} );
} );
