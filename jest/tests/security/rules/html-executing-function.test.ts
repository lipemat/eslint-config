import ruleTester from '../../../helpers/rule-tester';
import htmlExecutingFunctionRule from '../../../../plugins/security/rules/html-executing-function';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

/**
 * Test isolation for the html-executing-function rule
 *
 * Most of the cases are covered by the @lipemat-rules.test.ts tests.
 * - Add new tests here for specific html-executing-function rule cases.
 */
describe( 'Not DOM element', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [
			{
				code: 'const form = new FormData();' +
					'form.after( content )',
			},
			{
				code: 'const notElement = {}; notElement.after( userInput )',
			},
			{
				code: 'const notElement = someFunction(); notElement.append( userInput )',
			},
			{
				code: 'const notElement = getSomething(); notElement.before( userInput )',
			},
			{
				code: 'const notElement = getSomethingElse(); notElement.prepend( userInput )',
			},
			{
				code: 'const notElement = anotherFunction(); notElement.replaceWith( userInput )',
			},
			{
				code: 'const notElement = yetAnotherFunction(); notElement.setAttribute( "data", userInput )',
			},
			{
				code: 'someFunction().after( userInput )',
			},
			{
				code: 'anotherFunction().append( userInput )',
			},
			{
				code: 'yetAnotherFunction().before( userInput )',
			},
			{
				code: 'getSomething().prepend( userInput )',
			},
			{
				code: 'getSomethingElse().replaceWith( userInput )',
			},
			{
				code: 'anotherFunctionCall().setAttribute( "data", userInput )',
			},
		],
		invalid: [],
	} );
} );


describe( 'Unescaped DOM element', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [],
		invalid: [
			{
				code: 'const el = document.querySelector( "foo" );' +
					'el.after( userInput )',
				errors: [
					{
						messageId: 'after',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.querySelector( "foo" );el.after( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.querySelector( "foo" );el.after( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementById( "foo" );' +
					'el.append( content )',
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementById( "foo" );el.append( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementById( "foo" );el.append( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementsByClassName( "foo" );' +
					'el[0].before( content )',
				errors: [
					{
						messageId: 'before',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementsByClassName( "foo" );el[0].before( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementsByClassName( "foo" );el[0].before( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.querySelectorAll( "foo" );' +
					'el[0].prepend( userInput )',
				errors: [
					{
						messageId: 'prepend',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.querySelectorAll( "foo" );el[0].prepend( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.querySelectorAll( "foo" );el[0].prepend( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: 'document.documentElement.replaceWith( content )',
				errors: [
					{
						messageId: 'replaceWith',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'document.documentElement.replaceWith( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'document.documentElement.replaceWith( sanitize( content ) )',
							},
						],
					},
				],
			},
		],
	} );
} );


describe( 'Using literal strings', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [
			{
				code: 'const el = document.getElementsByClassName( "foo" );' +
					'el.append( "<div>Safe Content</div>" )',
			},
			{
				code: 'const el = document.getElementById( "foo" );' +
					'el.after( "<span>Another Safe Content</span>" )',
			},
			{
				code: 'const el = document.querySelector( "foo" );' +
					'el.before( "<p>Paragraph</p>" )',
			},
			{
				code: 'const el = document.querySelectorAll( "foo" );' +
					'el[0].prepend( "<section>Section</section>" )',
			},
			{
				code: 'document.body.replaceWith( "<main>Main Content</main>" )',
			},
			{
				code: 'const el = document.createElement( "div" );' +
					'el.setAttribute( "data-info", "Some safe data" )',
			},
			{
				code: 'const el = document.getElementsByTagName( "foo" );' +
					'el[0].setAttribute( "title", "A safe title" )',
			},
			{
				code: 'const el = document.body;' +
					'el.setAttribute( "aria-label", "A safe aria label" )',
			},
		],
		invalid: [],
	} );
} );

describe( 'Unsafe literal string', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [],
		invalid: [
			'"data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=="',
			'`<div>${userInput}</div>`',
			'"javascript:alert(1)"',
			'"<svg><script>alert(1)</script></svg>"',
			'"vbscript:msgbox(\'XSS\')"',
		].map( code => {
			return {
				code: 'const el = document.getElementsByClassName( "foo" );' +
					`el[0].append( ${code} )`,
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: `const el = document.getElementsByClassName( "foo" );el[0].append( DOMPurify.sanitize( ${code} ) )`,
							},
							{
								messageId: 'sanitize',
								output: `const el = document.getElementsByClassName( "foo" );el[0].append( sanitize( ${code} ) )`,
							},
						],
					},
				],
			};
		} ),
	} );
} );
