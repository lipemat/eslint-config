import noFallbackInCondition from './rules/no-fallback-in-condition.js';
import {readFileSync} from 'fs';
import {dirname, resolve} from 'path';
import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';
import {fileURLToPath} from 'url';

const __dirname = dirname( fileURLToPath( import.meta.url ) );
const pkg = JSON.parse(
	readFileSync( resolve( __dirname, 'package.json' ), 'utf8' )
);


type Plugin = FlatConfig.Plugin & {
	configs: {
		recommended: FlatConfig.Config;
	}
}

const plugin: Plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
	},
	rules: {
		'no-fallback-in-condition': noFallbackInCondition,
	},
	configs: {
		recommended: {},
	},
};

// Freeze the plugin to prevent modifications and use the plugin within.
plugin.configs = Object.freeze( {
	recommended: {
		plugins: {
			'@lipemat/best-practices': plugin,
		},
		rules: {
			'@lipemat/best-practices/no-fallback-in-condition': 'warn',
		},
	},
} );

export default plugin;
