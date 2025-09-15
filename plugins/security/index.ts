import dangerouslySetInnerHtml from './rules/dangerously-set-inner-html.js';
import htmlExecutingAssignment from './rules/html-executing-assignment.js';
import htmlExecutingFunction from './rules/html-executing-function.js';
import htmlSinks from './rules/html-sinks.js';
import htmlStringConcat from './rules/html-string-concat.js';
import jqueryExecuting from './rules/jquery-executing.js';
import vulnerableTagStripping from './rules/vulnerable-tag-stripping.js';
import windowEscaping from './rules/window-escaping.js';
import noAtHtmlTags from './rules/no-at-html-tags.js';
import {readFileSync} from 'fs';
import {resolve} from 'path';
import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';


const pkg = JSON.parse(
	readFileSync( resolve( './package.json' ), 'utf8' ),
);


type Plugin = FlatConfig.Plugin & {
	configs: {
		recommended: FlatConfig.Config;
		svelte: FlatConfig.Config;
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
		'no-at-html-tags': noAtHtmlTags,
		'vulnerable-tag-stripping': vulnerableTagStripping,
		'window-escaping': windowEscaping,
	},
	configs: {
		recommended: {},
		svelte: {},
	},
};

// Freeze the plugin to prevent modifications and use the plugin within.
plugin.configs = Object.freeze( {
	recommended: {
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
			'@lipemat/security/vulnerable-tag-stripping': 'error',
			'@lipemat/security/window-escaping': 'error',
		},
	},
	svelte: {
		files: [ '**/*.svelte', '*.svelte' ],
		rules: {
			'@lipemat/security/no-at-html-tags': 'error',
		},
	},
} );

export default plugin;
