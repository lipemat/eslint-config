import {join, resolve} from 'path';

/**
 * Run a separate process to execute Jest with the eslint runner.
 *
 * @see root jest.config.ts which receives the `FIXTURE` environment variable.
 */
import execa from 'execa';

const normalize = ( output: string ) =>
	output
		.replace( /(([✕✓]) .* )\(\d*(\.\d+)? ?m?s\)/g, '$1' )
		.replace( /\(\d*(\.\d+)? ?m?s\)/g, '(mocked ms)' )
		.replace( /(Time: {8})\d*(\.\d+)? ?m?s/, '$1' );

const jestRunnerEslint = async ( testDir, options = [] ) => {
	jest.setTimeout( 30_000 );

	const {stdout, stderr} = await execa(
		'yarn jest',
		[ '--useStderr', '--no-watchman', '--no-cache' ].concat( options ),
		{
			cwd: resolve( __dirname + '/../../' ),
			env: {
				FIXTURE: join( resolve( __dirname + '/../' ), 'fixtures', testDir ),
				FORCE_COLOR: '0',
			},
			extendEnv: false,
			reject: false,
		} );
	return `${normalize( stderr )}\n${normalize( stdout )}`;
};

export default jestRunnerEslint;
