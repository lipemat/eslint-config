import windowEscapingRule, {isSafeUrlString} from '../../../../plugins/security/rules/window-escaping';
import ruleTester from '../../../helpers/rule-tester';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

/**
 * Test isolation for the window-escaping rule
 *
 * Most of the cases are covered by the @lipemat-rules.test.ts tests.
 * - Add new tests here for specific window-escaping rule cases.
 */

describe( 'Utilities', () => {
	test( 'isSafeUrlString', () => {
		expect( isSafeUrlString( 'about:blank' ) ).toBe( false );
		expect( isSafeUrlString( 'javascript:alert(1)' ) ).toBe( false );
		expect( isSafeUrlString( 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' ) ).toBe( false );
		expect( isSafeUrlString( 'vbscript:msgbox("XSS")' ) ).toBe( false );
		expect( isSafeUrlString( 'livescript:alert(1)' ) ).toBe( false );
		expect( isSafeUrlString( 'javascript%3Aalert(1)' ) ).toBe( false );

		expect( isSafeUrlString( 'https://example.com' ) ).toBe( true );
		expect( isSafeUrlString( 'http://localhost' ) ).toBe( true );
		expect( isSafeUrlString( '/relative/path' ) ).toBe( true );
		expect( isSafeUrlString( './relative/path' ) ).toBe( true );
		expect( isSafeUrlString( '../relative/path' ) ).toBe( true );
		expect( isSafeUrlString( '?query=string' ) ).toBe( true );
		expect( isSafeUrlString( '#hash-fragment' ) ).toBe( true );
	} );
} );


describe( 'window.location assignment', () => {
	ruleTester.run( 'window-escaping', windowEscapingRule, {
		valid: [
			{
				code: 'window.location.href = sanitize( userInput )',
			},
			{
				code: 'window.location.src = DOMPurify.sanitize( userInput )',
			},
			{
				code: 'window.location.action = "https://example.com"',
			},
			{
				code: 'window.location.protocol = "/relative/path"',
			},
			{
				code: 'window.location.host = "./relative/path"',
			},
			{
				code: 'window.location.hostname = "../relative/path"',
			},
			{
				code: 'window.location.pathname = "?query=string"',
			},
			{
				code: 'window.location.search = "#hash-fragment"',
			},
		],
		invalid: [
			{
				code: 'window.location.href = userInput',
				errors: [
					{
						messageId: 'unsafeWindowLocation',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'href',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.location.href = sanitize( userInput )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.href = DOMPurify.sanitize( userInput )',
							},
						],
					},

				],
			},
			{
				code: 'window.location.href = encodeURIComponent( userInput )',
				errors: [
					{
						messageId: 'unsafeWindowLocation',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'href',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.location.href = sanitize( encodeURIComponent( userInput ) )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.href = DOMPurify.sanitize( encodeURIComponent( userInput ) )',
							},
						],
					},

				],
			},
			{
				code: 'window.location.href = "javascript:alert(1)"',
				errors: [
					{
						messageId: 'unsafeWindowLocation',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'href',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.location.href = sanitize( "javascript:alert(1)" )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.href = DOMPurify.sanitize( "javascript:alert(1)" )',
							},
						],
					},
				],
			},
			{
				code: 'window.location.href = "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="',
				errors: [
					{
						messageId: 'unsafeWindowLocation',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'href',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.location.href = sanitize( "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.href = DOMPurify.sanitize( "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==" )',
							},
						],
					},
				],
			},
			{
				code: 'window.location.pathname = `#${encodeURIComponent(userInput)}`',
				errors: [
					{
						messageId: 'unsafeWindowLocation',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'pathname',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.location.pathname = sanitize( `#${encodeURIComponent(userInput)}` )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.pathname = DOMPurify.sanitize( `#${encodeURIComponent(userInput)}` )',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'window.* assignment', () => {
	ruleTester.run( 'window-escaping', windowEscapingRule, {
		valid: [
			{
				code: 'window.name = sanitize( userInput )',
			},
			{
				code: 'window.name = DOMPurify.sanitize( userInput )',
			},
		],
		invalid: [
			{
				code: 'window.name = userInput',
				errors: [
					{
						messageId: 'unsafeWindow',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'name',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.name = sanitize( userInput )',
							},
							{
								messageId: 'domPurify',
								output: 'window.name = DOMPurify.sanitize( userInput )',
							},
						],
					},

				],
			},
			{
				code: 'window.status = userInput',
				errors: [
					{
						messageId: 'unsafeWindow',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'status',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.status = sanitize( userInput )',
							},
							{
								messageId: 'domPurify',
								output: 'window.status = DOMPurify.sanitize( userInput )',
							},
						],
					},
				],
			},
			{
				code: 'window.name = encodeURIComponent( userInput )',
				errors: [
					{
						messageId: 'unsafeWindow',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propName: 'name',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'window.name = sanitize( encodeURIComponent( userInput ) )',
							},
							{
								messageId: 'domPurify',
								output: 'window.name = DOMPurify.sanitize( encodeURIComponent( userInput ) )',
							},
						],
					},

				],
			},
		],
	} );
} );
