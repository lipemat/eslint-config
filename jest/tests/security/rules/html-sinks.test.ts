import ruleTester from '../../../helpers/rule-tester';
import htmlSinksRule from '../../../../plugins/security/rules/html-sinks';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

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

describe( 'body.style.cssText', () => {
	ruleTester.run( 'html-sinks', htmlSinksRule, {
		valid: [
			{
				code: 'body.style.cssText = "color: red;"',
			},
			{
				code: 'body.style.cssText = DOMPurify.sanitize( userStyles )',
			},
			{
				code: 'body.style.cssText = sanitize( userStyles )',
			},
		],
		invalid: [
			{
				code: 'body.style.cssText = userStyles',
				errors: [
					{
						messageId: 'cssTextUnsanitized',
						type: AST_NODE_TYPES.AssignmentExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'body.style.cssText = DOMPurify.sanitize( userStyles )',
							},
							{
								messageId: 'sanitize',
								output: 'body.style.cssText = sanitize( userStyles )',
							},
						],
					},
				],
			},
			{
				code: 'body.style.cssText = dynamicStyles + "; color: blue;"',
				errors: [
					{
						messageId: 'cssTextUnsanitized',
						type: AST_NODE_TYPES.AssignmentExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'body.style.cssText = DOMPurify.sanitize( dynamicStyles + "; color: blue;" )',
							},
							{
								messageId: 'sanitize',
								output: 'body.style.cssText = sanitize( dynamicStyles + "; color: blue;" )',
							},
						],
					},
				],
			},
		],
	} );
} );
