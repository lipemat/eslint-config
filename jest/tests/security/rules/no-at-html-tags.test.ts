import noAtHtmlTags from '../../../../plugins/security/rules/no-at-html-tags';
import {RuleTester} from '../../../helpers/eslint-compat';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as parser from 'svelte-eslint-parser';

const tester = new RuleTester( {
	languageOptions: {
		parser,
		ecmaVersion: 'latest',
		sourceType: 'module',
	},
} );

/**
 * Test isolation for the no-at-html-tags rule.
 */

describe( 'No @html tags', () => {
	// @ts-ignore
	tester.run( 'no-at-html-tags', noAtHtmlTags, {
		valid: [
			{
				code: '() => <div>{@html sanitize(arbuitrary)}</div>',
			},
			{
				code: '() => <div>{@html DOMPurify.sanitize(arbuitrary)}</div>',
			},
		],
		invalid: [
			{
				code: '() => <div>{@html arbuitrary}</div>',
				errors: [
					{
						messageId: 'dangerousHtml',
						type: 'SvelteMustacheTag',
						suggestions: [
							{
								messageId: 'domPurify',
								output: '() => <div>{@html DOMPurify.sanitize( arbuitrary )}</div>',
							},
							{
								messageId: 'sanitize',
								output: '() => <div>{@html sanitize( arbuitrary )}</div>',
							},
						],
					},
				],
			},
		],
	} );
} );
