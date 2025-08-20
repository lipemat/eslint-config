import noUnsafeValue from './rules/no-unsafe-value.js';
import dangerouslySetInnerHtml from './rules/dangerously-set-inner-html.js';
import jqueryExecuting from './rules/jquery-executing.js';
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
		'dangerously-set-inner-html': dangerouslySetInnerHtml,
		'jquery-executing': jqueryExecuting,
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
				'@lipemat/security/dangerously-set-inner-html': 'error',
				'@lipemat/security/jquery-executing': 'error',
			},
		},
	],
} );


export default plugin;
