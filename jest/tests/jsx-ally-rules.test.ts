import jestRunnerEslint from '../../jest/helpers/jest-runner-eslint';

describe( 'JSX A11Y rules are enabled', () => {
	test( 'jsx-a11y/label-has-associated-control', async () => {
		expect( await jestRunnerEslint( 'passing/jsx-ally/label-has-associated-control' ) ).toMatchSnapshot();

		expect( await jestRunnerEslint( 'failing/jsx-ally/label-has-associated-control' ) ).toMatchSnapshot();
	} );
} );
