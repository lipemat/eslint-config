import noUnsafeValue from './rules/no-unsafe-value.js';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import type {FlatConfig} from '@typescript-eslint/utils/dist/ts-eslint/Config';

const pkg = JSON.parse(
	readFileSync( resolve( './package.json' ), 'utf8' ),
);

const plugin: FlatConfig.Plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
	},
	rules: {
		'no-unsafe-value': noUnsafeValue,
	},
};

plugin.configs = Object.freeze( {
	recommended: [
		{
			plugins: {
				'@lipemat/security': plugin,
			},
			rules: {
				'@lipemat/security/no-unsafe-value': 'error',
			},
		},
	],
} );


export default plugin;
