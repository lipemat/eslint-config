import {getExtensionsConfig} from '@lipemat/js-boilerplate/helpers/config.js';


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
 * @return {Object[]} - `eslint.Linter.Config[]`
 */
export function getConfig( mergedConfig ) {
	const BASE = {configs: mergedConfig};
	mergedConfig = {...BASE, ...getExtensionsConfig( 'eslint.config', BASE )};
	return mergedConfig.configs;
}
