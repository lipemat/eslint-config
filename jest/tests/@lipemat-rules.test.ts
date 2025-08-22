import jestRunnerEslint from '../helpers/jest-runner-eslint';
import dangerouslySetInnerHtmlRule from '../../plugins/security/rules/dangerously-set-inner-html';
import jqueryExecutingRule from '../../plugins/security/rules/jquery-executing';
import htmlExecutingFunctionRule from '../../plugins/security/rules/html-executing-function';
import htmlExecutingAssignmentRule from '../../plugins/security/rules/html-executing-assignment';
import htmlStringConcatRule from '../../plugins/security/rules/html-string-concat';
import vulnerableTagStrippingRule from '../../plugins/security/rules/vulnerable-tag-stripping';
import windowEscapingRule, {isSafeUrlString} from '../../plugins/security/rules/window-escaping';
import htmlSinksRule from '../../plugins/security/rules/html-sinks';
import {AST_NODE_TYPES} from '@typescript-eslint/types';
import ruleTester from '../helpers/rule-tester';

describe( '@lipemat rules are enabled', () => {
	test( '@lipemat/no-unsafe-value failing', async () => {
		expect( await jestRunnerEslint( 'failing/@lipemat/security' ) ).toMatchSnapshot();
	} );

	test( '@lipemat/no-unsafe-value passing', async () => {
		expect( await jestRunnerEslint( 'passing/@lipemat/security' ) ).toMatchSnapshot();
	} );
} );

describe( 'jQuery Executing', () => {
	ruleTester.run( 'jquery-executing', jqueryExecutingRule, {
		valid: [
			{
				code: '$( \'body\' ).after( sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).append( DOMPurify.sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).appendTo( sanitize( content ) )',
			},
			{
				code: '$( \'body\' ).before( DOMPurify.sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).html( sanitize( content ) )',
			},
			{
				code: '$( \'body\' ).insertAfter( sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).insertBefore( DOMPurify.sanitize( content ) )',
			},
			{
				code: '$( \'body\' ).prepend( sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).prependTo( DOMPurify.sanitize( content ) )',
			},
			{
				code: '$( \'body\' ).replaceAll( sanitize( arbitrary ) )',
			},
			{
				code: '$( \'body\' ).replaceWith( DOMPurify.sanitize( content ) )',
			},
			{
				code: '$( \'body\' ).html( sanitize( userInput ) ).text()',
			},
			// Passing an element.
			{
				code: 'const foo = $("div"); $( \'body\' ).after(foo)',
			},
			{
				code: '$( \'body\' ).prepend(jQuery("div"))',
			},
		],
		invalid: [
			{
				code: '$( \'body\' ).after( arbitrary )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'after',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).after( DOMPurify.sanitize( arbitrary ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).after( sanitize( arbitrary ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).append( content )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'append',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).append( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).append( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).appendTo( userInput )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'appendTo',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).appendTo( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).appendTo( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).before( arbitrary )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'before',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).before( DOMPurify.sanitize( arbitrary ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).before( sanitize( arbitrary ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).html( userInput )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'html',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).html( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).html( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).insertAfter( content )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'insertAfter',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).insertAfter( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).insertAfter( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).insertBefore( userInput )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'insertBefore',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).insertBefore( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).insertBefore( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).prepend( arbitrary )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'prepend',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).prepend( DOMPurify.sanitize( arbitrary ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).prepend( sanitize( arbitrary ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).prependTo( content )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'prependTo',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).prependTo( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).prependTo( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).replaceAll( userInput )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'replaceAll',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).replaceAll( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).replaceAll( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).replaceWith( arbitrary )',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'replaceWith',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).replaceWith( DOMPurify.sanitize( arbitrary ) )',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).replaceWith( sanitize( arbitrary ) )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).html( userInput ).text()',
				errors: [
					{
						messageId: 'needsEscaping',
						type: AST_NODE_TYPES.CallExpression,
						data: {
							methodName: 'html',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: '$( \'body\' ).html( DOMPurify.sanitize( userInput ) ).text()',
							},
							{
								messageId: 'sanitize',
								output: '$( \'body\' ).html( sanitize( userInput ) ).text()',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'Dangerously Set Inner HTML', () => {
	ruleTester.run( 'dangerously-set-inner-html', dangerouslySetInnerHtmlRule, {
		valid: [
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: sanitize( arbitrary )}} /></div>',
			},
		],
		invalid: [
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: arbitrary}} /></div>',
				errors: [
					{
						messageId: 'dangerousInnerHtml',
						type: AST_NODE_TYPES.JSXAttribute,
						suggestions: [
							{
								messageId: 'domPurify',
								output: '() => <div><div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize( arbitrary )}} /></div>',
							},
							{
								messageId: 'sanitize',
								output: '() => <div><div dangerouslySetInnerHTML={{__html: sanitize( arbitrary )}} /></div>',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'HTML Executing Assignment', () => {
	ruleTester.run( 'html-executing-assignment', htmlExecutingAssignmentRule, {
		valid: [
			// Property assignments with sanitization
			{
				code: 'element.innerHTML = sanitize( content )',
			},
			{
				code: 'element.outerHTML = DOMPurify.sanitize( arbitrary )',
			},
		],
		invalid: [
			// Property assignments without sanitization
			{
				code: 'const el = document.querySelector( "foo" );el.innerHTML = userInput',
				errors: [
					{
						messageId: 'executed',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propertyName: 'innerHTML',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.querySelector( "foo" );el.innerHTML = DOMPurify.sanitize( userInput )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.querySelector( "foo" );el.innerHTML = sanitize( userInput )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementById( "foo" );el.outerHTML = content',
				errors: [
					{
						messageId: 'executed',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propertyName: 'outerHTML',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementById( "foo" );el.outerHTML = DOMPurify.sanitize( content )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementById( "foo" );el.outerHTML = sanitize( content )',
							},
						],
					},
				],
			},
			{
				code: `document.body.innerHTML = arbitrary; document.body.outerHTML = arbitrary;`,
				errors: [
					{
						messageId: 'executed',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propertyName: 'innerHTML',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: `document.body.innerHTML = DOMPurify.sanitize( arbitrary ); document.body.outerHTML = arbitrary;`,
							},
							{
								messageId: 'sanitize',
								output: `document.body.innerHTML = sanitize( arbitrary ); document.body.outerHTML = arbitrary;`,
							},
						],
					},
					{
						messageId: 'executed',
						type: AST_NODE_TYPES.AssignmentExpression,
						data: {
							propertyName: 'outerHTML',
						},
						suggestions: [
							{
								messageId: 'domPurify',
								output: `document.body.innerHTML = arbitrary; document.body.outerHTML = DOMPurify.sanitize( arbitrary );`,
							},
							{
								messageId: 'sanitize',
								output: `document.body.innerHTML = arbitrary; document.body.outerHTML = sanitize( arbitrary );`,
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'HTML Executing Function', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [
			// Document methods with sanitization
			{
				code: 'document.write( sanitize( content ) )',
			},
			{
				code: 'document.writeln( DOMPurify.sanitize( arbitrary ) )',
			},
			// Element methods with sanitization
			{
				code: 'const el = document.querySelector( "foo" ); el.after( sanitize( content ) )',
			},
			{
				code: 'const el = document.getElementById( "foo" ); el.append( DOMPurify.sanitize( arbitrary ) )',
			},
			{
				code: 'const el = document.getElementsByClassName( "foo" )[0]; el.before( DOMPurify.sanitize( arbitrary ) )',
			},
			{
				code: 'const el = document.getElementsByTagName( "div" )[0]; el.prepend( sanitize( content ) )',
			},
			{
				code: 'const el = document.querySelector( ".foo" ); el.replaceWith( DOMPurify.sanitize( arbitrary ) )',
			},
			{
				code: 'const el = document.getElementById( "foo" ); el.insertAdjacentHTML( \'beforeend\', sanitize( content ) )',
			},
			{
				code: 'const el = document.querySelector( "#bar" ); el.insertAdjacentHTML( \'afterend\', DOMPurify.sanitize( content ) )',
			},
			// Passing an element.
			{
				code: 'const foo = document.getElementById( "foo" ); const el = document.querySelector( "bar" ); el.after( foo )',
			},
			{
				code: 'const passElement: HTMLBodyElement = document.getElementById( "body" ); const el = document.querySelector( "div" ); el.before( passElement )',
			},
		],
		invalid: [
			// Document methods without sanitization
			{
				code: 'document.write( userInput )',
				errors: [
					{
						messageId: 'document.write',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'document.write( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: 'document.write( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: 'document.writeln( arbitrary )',
				errors: [
					{
						messageId: 'document.writeln',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'document.writeln( DOMPurify.sanitize( arbitrary ) )',
							},
							{
								messageId: 'sanitize',
								output: 'document.writeln( sanitize( arbitrary ) )',
							},
						],
					},
				],
			},
			// Element methods without sanitization
			{
				code: 'const el = document.querySelector( "foo" ); el.after( userInput )',
				errors: [
					{
						messageId: 'after',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.querySelector( "foo" ); el.after( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.querySelector( "foo" ); el.after( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementById( "foo" ); el.append( content )',
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementById( "foo" ); el.append( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementById( "foo" ); el.append( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementsByClassName( "foo" )[0]; el.before( content )',
				errors: [
					{
						messageId: 'before',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementsByClassName( "foo" )[0]; el.before( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementsByClassName( "foo" )[0]; el.before( sanitize( content ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.getElementsByTagName( "div" )[0]; el.prepend( userInput )',
				errors: [
					{
						messageId: 'prepend',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.getElementsByTagName( "div" )[0]; el.prepend( DOMPurify.sanitize( userInput ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.getElementsByTagName( "div" )[0]; el.prepend( sanitize( userInput ) )',
							},
						],
					},
				],
			},
			{
				code: 'const el = document.querySelector( ".foo" ); el.replaceWith( content )',
				errors: [
					{
						messageId: 'replaceWith',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'domPurify',
								output: 'const el = document.querySelector( ".foo" ); el.replaceWith( DOMPurify.sanitize( content ) )',
							},
							{
								messageId: 'sanitize',
								output: 'const el = document.querySelector( ".foo" ); el.replaceWith( sanitize( content ) )',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'HTML String Concatenation', () => {
	ruleTester.run( 'html-string-concat', htmlStringConcatRule, {
		valid: [
			// Wrapped in a function before direct assignment
			{
				code: 'element.innerHTML = wrapped("div>" + userInput + "</div>")',
			},
			{
				code: 'const html = other("<p>" + content + "</p>")',
			},
			// Non-HTML string concatenation (no < or > characters)
			{
				code: 'const message = "Hello " + name + "!"',
			},
			{
				code: 'element.textContent = "Value: " + userInput',
			},
		],
		invalid: [
			// Assignment with HTML string concatenation
			{
				code: 'element.innerHTML = "<div>" + userInput + "</div>"',
				errors: [
					{
						messageId: 'htmlStringConcat',
						type: AST_NODE_TYPES.AssignmentExpression,
					},
				],
			},
			// Variable declaration with HTML string concatenation
			{
				code: 'const html = "<p>" + content + "</p>"',
				errors: [
					{
						messageId: 'htmlStringConcat',
						type: AST_NODE_TYPES.VariableDeclarator,
					},
				],
			},
		],
	} );
} );

describe( 'Vulnerable Tag Stripping', () => {
	ruleTester.run( 'vulnerable-tag-stripping', vulnerableTagStrippingRule, {
		valid: [
			{
				code: '$( \'body\' ).html(  sanitize( userInput ) )',
			},
			{
				code: '$( \'body\' ).text()',
			},
			{
				code: 'element.html( userInput ).text()',
			},
			{
				code: 'const foo = $("div"); $( \'body\' ).html(foo)',
			},
		],
		invalid: [
			{
				code: '$( \'body\' ).html( userInput ).text()',
				errors: [
					{
						messageId: 'vulnerableTagStripping',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'useTextOnly',
								output: '$( \'body\' ).text( userInput )',
							},
						],
					},
				],
			},
			{
				code: '$( \'body\' ).html( sanitize( userInput ) ).text()',
				errors: [
					{
						messageId: 'vulnerableTagStripping',
						type: AST_NODE_TYPES.CallExpression,
						suggestions: [
							{
								messageId: 'useTextOnly',
								output: '$( \'body\' ).text( sanitize( userInput ) )',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'Window Escaping', () => {
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


	ruleTester.run( 'window-escaping', windowEscapingRule, {
		valid: [
			{
				code: 'window.location.href = sanitize( userInput )',
			},
			{
				code: 'window.name = sanitize( userInput )',
			},
			{
				code: 'window.name = DOMPurify.sanitize( userInput )',
			},
			// Safe literal assignments
			{
				code: 'window.location.href = "#section"',
			},
			{
				code: 'window.location.href = "/path/to/page"',
			},
			// Reading
			{
				code: 'const w = sanitize(  window.location.hostname  )',
			},
			{
				code: 'const w = DOMPurify.sanitize(  window.name  )',
			},
		],
		invalid: [
			// Invalid window.location assignments without escaping
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
				code: 'window.location.pathname = userInput',
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
								output: 'window.location.pathname = sanitize( userInput )',
							},
							{
								messageId: 'domPurify',
								output: 'window.location.pathname = DOMPurify.sanitize( userInput )',
							},
						],
					},
				],
			},
			// Invalid window assignments without escaping
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
			// Using urlencoded for window properties
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
			// Reading from the properties
			{
				code: 'const w = window.name',
				errors: [
					{
						messageId: 'unsafeRead',
						type: AST_NODE_TYPES.MemberExpression,
						data: {
							propName: 'name',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'const w = sanitize( window.name )',
							},
							{
								messageId: 'domPurify',
								output: 'const w = DOMPurify.sanitize( window.name )',
							},
						],
					},
				],
			},
			{
				code: 'const w = window.location.protocol',
				errors: [
					{
						messageId: 'unsafeRead',
						type: AST_NODE_TYPES.MemberExpression,
						data: {
							propName: 'protocol',
						},
						suggestions: [
							{
								messageId: 'sanitize',
								output: 'const w = sanitize( window.location.protocol )',
							},
							{
								messageId: 'domPurify',
								output: 'const w = DOMPurify.sanitize( window.location.protocol )',
							},
						],
					},
				],
			},
		],
	} );
} );

describe( 'HTML Sinks', () => {
	ruleTester.run( 'html-sinks', htmlSinksRule, {
		valid: [
			// setTimeout with function (valid)
			{
				code: 'setTimeout(function() { console.log("test"); }, 1000)',
			},
			{
				code: 'setTimeout(() => console.log("test"), 1000)',
			},
			{
				code: 'setTimeout(myFunction, 1000)',
			},
			// setInterval with function (valid)
			{
				code: 'setInterval(function() { console.log("test"); }, 1000)',
			},
			{
				code: 'setInterval(() => console.log("test"), 1000)',
			},
			{
				code: 'setInterval(myFunction, 1000)',
			},
			// window.open with sanitized input (valid)
			{
				code: 'window.open(sanitize( userInput ))',
			},
			{
				code: 'window.open(DOMPurify.sanitize( userInput ))',
			},
			// body.style.cssText with literal string (valid)
			{
				code: 'body.style.cssText = "color: red; font-size: 14px;"',
			},
			// body.style.cssText with sanitized input (valid)
			{
				code: 'body.style.cssText = sanitize( userStyles )',
			},
			{
				code: 'body.style.cssText = DOMPurify.sanitize( userStyles )',
			},
		],
		invalid: [
			{
				code: 'const w = "hacking your site"; setTimeout(w, 1000)',
				errors: [
					{
						messageId: 'setTimeoutString',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			// setTimeout with string (invalid - no replacement)
			{
				code: 'setTimeout("console.log(\'test\')", 1000)',
				errors: [
					{
						messageId: 'setTimeoutString',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: 'setTimeout(`console.log("${message}")`, 1000)',
				errors: [
					{
						messageId: 'setTimeoutString',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			// setInterval with string (invalid - no replacement)
			{
				code: 'setInterval("console.log(\'test\')", 1000)',
				errors: [
					{
						messageId: 'setIntervalString',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: 'setInterval(`console.log("${message}")`, 1000)',
				errors: [
					{
						messageId: 'setIntervalString',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			// window.open without sanitization (invalid - needs sanitization)
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
			// body.style.cssText with non-literal, non-sanitized value (invalid)
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
