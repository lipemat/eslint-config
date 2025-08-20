import noUnsafeValue from './rules/no-unsafe-value.js';
import dangerouslySetInnerHtml from './rules/dangerously-set-inner-html.js';
import jqueryExecuting from './rules/jquery-executing.js';
import htmlExecutingFunction from './rules/html-executing-function.js';
import htmlExecutingAssignment from './rules/html-executing-assignment.js';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';


const pkg = JSON.parse(
	readFileSync( resolve( './package.json' ), 'utf8' ),
);


type Plugin = FlatConfig.Plugin & {
	configs: {
		recommended: FlatConfig.ConfigArray;
	}
}

const plugin: Plugin = {
	meta: {
		name: pkg.name,
		version: pkg.version,
	},
	rules: {
		'no-unsafe-value': noUnsafeValue,
		'dangerously-set-inner-html': dangerouslySetInnerHtml,
		'html-executing-assignment': htmlExecutingAssignment,
		'html-executing-function': htmlExecutingFunction,
		'jquery-executing': jqueryExecuting,
	},
	configs: {
		recommended: [],
	},
};

// Freeze the plugin to prevent modifications and use the plugin within.
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
				'@lipemat/security/html-executing-assignment': 'error',
				'@lipemat/security/html-executing-function': 'error',
			},
		},
	],
} );


export default plugin;
