import {getExtensionsConfig} from '@lipemat/js-boilerplate/helpers/config.js';
import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';


export type ExtensionConfigs = { configs: FlatConfig.Config[] };

/**
 * Get a config from our /index.js merged with any
 * matching configuration from the project directory.
 *
 * For instance, if we have a file named config/eslint.config.js in our project
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
 */
export function getConfig( configs: FlatConfig.Config[] ): FlatConfig.Config[] {
	const BASE = {
		configs,
	};
	const mergedConfig: ExtensionConfigs = {
		...BASE,
		...getExtensionsConfig<ExtensionConfigs>( 'eslint.config', BASE ),
	};
	return mergedConfig.configs;
}
