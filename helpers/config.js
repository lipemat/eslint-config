const {getExtensionsConfig} = require( '@lipemat/js-boilerplate/helpers/config' );
const {getPackageConfig} = require( '@lipemat/js-boilerplate/helpers/package-config' );
const path = require( 'path' );


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
 * // standard
 * module.export = {
 *     externals: {extra: 'Extra'}
 * }
 * // function
 * module.exports = function( config ) {
 *     return {
 *         externals: {...config.externals, extra: 'Extra'}
 *     }
 * }
 * ```
 *
 * @return {Object}
 */
function getConfig( mergedConfig ) {
	mergedConfig = {...mergedConfig, ...getExtensionsConfig( 'eslint.config', mergedConfig )};
	try {
		const localConfig = require( path.resolve( getPackageConfig().packageDirectory + '/config', 'eslint.config' ) );
		if ( 'function' === typeof localConfig ) {
			mergedConfig = {...mergedConfig, ...localConfig( mergedConfig )};
		} else {
			mergedConfig = {...mergedConfig, ...localConfig};
		}
	} catch ( e ) {
	}
	return mergedConfig;
}

module.exports = {
	getConfig,
};
