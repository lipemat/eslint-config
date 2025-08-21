import ruleTester from '../../../helpers/rule-tester';
import htmlSinksRule from '../../../../plugins/security/rules/html-sinks';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

/**
 * Test isolation for the html-sinks rule
 *
 * Most of the cases are covered by the @lipemat-rules.test.ts tests.
 * - Add new tests here for specific html-sinks rule cases.
 */

describe( 'window.open', () => {
	ruleTester.run( 'html-sinks', htmlSinksRule, {
		valid: [
			{
				code: 'window.open(sanitize( userInput ))',
			},
			{
				code: 'window.open(DOMPurify.sanitize( userInput ))',
			},
		],
		invalid: [
			{
				code: 'window.open(userInput)',
				errors: [
					{
						messageId: 'windowOpenUnsanitized',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'window.open(DOMPurify.sanitize( userInput ))',
							},
							{
								messageId: 'sanitize',
								output: 'window.open(sanitize( userInput ))',
							},
						],
					},
				],
			},
			{
				code: 'window.open(dynamicUrl)',
				errors: [
					{
						messageId: 'windowOpenUnsanitized',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'window.open(DOMPurify.sanitize( dynamicUrl ))',
							},
							{
								messageId: 'sanitize',
								output: 'window.open(sanitize( dynamicUrl ))',
							},
						],
					},
				],
			},
		],
	} );
} );
