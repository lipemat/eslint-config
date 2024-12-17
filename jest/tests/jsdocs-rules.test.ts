import jestRunnerEslint from '../../jest/helpers/jest-runner-eslint';

describe( 'JSDoc rules are enabled', () => {
	test( 'jsdoc/check-access', async () => {
		expect( await jestRunnerEslint( 'failing/jsdoc/check-access' ) ).toMatchSnapshot();
	} );


	test( 'jsdoc/require-param', async () => {
		expect( await jestRunnerEslint( 'passing/jsdoc/require-param' ) ).toMatchSnapshot();
	} );
} );
