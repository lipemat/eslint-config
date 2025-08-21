import dangerouslySetInnerHtml from './rules/dangerously-set-inner-html.js';
import htmlExecutingAssignment from './rules/html-executing-assignment.js';
import htmlExecutingFunction from './rules/html-executing-function.js';
import htmlSinks from './rules/html-sinks.js';
import htmlStringConcat from './rules/html-string-concat.js';
import jqueryExecuting from './rules/jquery-executing.js';
import noUnsafeValue from './rules/no-unsafe-value.js';
import vulnerableTagStripping from './rules/vulnerable-tag-stripping.js';
import windowEscaping from './rules/window-escaping.js';
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
		'dangerously-set-inner-html': dangerouslySetInnerHtml,
		'html-executing-assignment': htmlExecutingAssignment,
		'html-executing-function': htmlExecutingFunction,
		'html-sinks': htmlSinks,
		'html-string-concat': htmlStringConcat,
		'jquery-executing': jqueryExecuting,
		'no-unsafe-value': noUnsafeValue,
		'vulnerable-tag-stripping': vulnerableTagStripping,
		'window-escaping': windowEscaping,
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
				'@lipemat/security/dangerously-set-inner-html': 'error',
				'@lipemat/security/html-executing-assignment': 'error',
				'@lipemat/security/html-executing-function': 'error',
				'@lipemat/security/html-sinks': 'error',
				'@lipemat/security/html-string-concat': 'error',
				'@lipemat/security/jquery-executing': 'error',
				'@lipemat/security/no-unsafe-value': 'error',
				'@lipemat/security/vulnerable-tag-stripping': 'error',
				'@lipemat/security/window-escaping': 'error',
			},
		},
	],
} );

export default plugin;
