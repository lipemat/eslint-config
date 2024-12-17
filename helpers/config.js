import {getExtensionsConfig} from '@lipemat/js-boilerplate/helpers/config.js';
import {getPackageConfig} from '@lipemat/js-boilerplate/helpers/package-config.js';
import path from 'path';


/**
 * Get a config from our /index.js merged with any
 * matching configuration from the project directory.
 *
 * For instance if we have a file named config/eslint.config.js in our project
 * we will merge the contents with our config/eslint.config.js in favor of whatever
 * is specified with the project's file.
 *
 * If the `module.exports` are a function, the existing configuration will be passed
 * as the only argument. Otherwise, standard `module.exports` are also supported.
 *
 * @see @lipemat/js-boilerplate/helpers/config
 *
 * @example ```ts
 * // function
 * module.exports = function( config: { configs: Linter.Config[] } ) {
 *     config.configs[0].push({extra: 'Extra'});
 *     return config
 * }
 * ```
 *
 * @return Linter.Config[]
 */
export function getConfig( mergedConfig ) {
	const BASE = {configs: mergedConfig};
	mergedConfig = {...BASE, ...getExtensionsConfig( 'eslint.config', BASE )};

	try {
		const localConfig = require( path.resolve( getPackageConfig().packageDirectory + '/config', 'eslint.config' ) );
		if ( 'function' === typeof localConfig ) {
			mergedConfig = {...mergedConfig, ...localConfig( mergedConfig )};
		} else {
			mergedConfig = {...mergedConfig, ...localConfig};
		}
	} catch ( e ) {
	}
	return mergedConfig.configs;
}
