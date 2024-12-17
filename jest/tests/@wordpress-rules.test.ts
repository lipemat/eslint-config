import jestRunnerEslint from '../helpers/jest-runner-eslint';

describe( 'WordPress rules are enabled', () => {
	test( '@wordpress/invalid-text-domain failing', async () => {
		expect( await jestRunnerEslint( 'failing/@wordpress/i18n-text-domain' ) ).toMatchSnapshot();

		expect( await jestRunnerEslint( 'passing/@wordpress/i18n-text-domain' ) ).toMatchSnapshot();
	} );
} );
