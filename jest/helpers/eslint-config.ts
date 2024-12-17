import execa from 'execa';
import {resolve} from 'path';

/**
 * Run a separate process to execute eslint commands
 */

export default async function getEslintConfig() {
	const {stdout, stderr} = await execa(
		'yarn eslint',
		[ '--print-config', 'index.js' ],
		{
			cwd: resolve( __dirname + '/../../' ),
			reject: false,
		} );
	return JSON.parse( stdout );
}
