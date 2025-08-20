import jestRunnerEslint from '../helpers/jest-runner-eslint';
import {RuleTester} from '@typescript-eslint/rule-tester';
import noUnsafeValueRule from '../../plugins/security/rules/no-unsafe-value';
import dangerouslySetInnerHtmlRule from '../../plugins/security/rules/dangerously-set-inner-html';
import jqueryExecutingRule from '../../plugins/security/rules/jquery-executing';
import htmlExecutingFunctionRule from '../../plugins/security/rules/html-executing-function';
import parser from '@typescript-eslint/parser';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

/**
 * @link https://typescript-eslint.io/packages/rule-tester
 */
const ruleTester = new RuleTester( {
	languageOptions: {
		parser,
		parserOptions: {
			allowDefaultProject: true,
			project: '../../tsconfig.json',
			projectService: {
				allowDefaultProject: [ '*.ts*', '*.tsx' ],
			},
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
} );


describe( '@lipemat rules are enabled', () => {
	test( '@lipemat/no-unsafe-value failing', async () => {
		expect( await jestRunnerEslint( 'failing/@lipemat/security' ) ).toMatchSnapshot();
	} );

	test( '@lipemat/no-unsafe-value passing', async () => {
		expect( await jestRunnerEslint( 'passing/@lipemat/security' ) ).toMatchSnapshot();
	} );
} );


describe( 'No Unsafe Value', () => {
	ruleTester.run( 'no-unsafe-value', noUnsafeValueRule, {
		valid: [
			{
				code: 'document.getElementById( \'body\' ).innerHTML = sanitize(arbitrary)',
			},
		],
		invalid: [
			{
				code: 'document.getElementById( \'body\' ).innerHTML = arbitrary',
				errors: [
					{
						message: 'Assignment to innerHTML must be sanitized.',
						type: AST_NODE_TYPES.AssignmentExpression,
					},
				],
			},
		],
	} );
} );

describe( 'jQuery Executing', () => {
	ruleTester.run( 'jquery-executing', jqueryExecutingRule, {
		valid: [
			{
				code: '$( \'body\' ).after( sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).append( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).appendTo( sanitize(content) )',
			},
			{
				code: '$( \'body\' ).before( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).html( sanitize(content) )',
			},
			{
				code: '$( \'body\' ).insertAfter( sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).insertBefore( DOMPurify.sanitize(content) )',
			},
			{
				code: '$( \'body\' ).prepend( sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).prependTo( DOMPurify.sanitize(content) )',
			},
			{
				code: '$( \'body\' ).replaceAll( sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).replaceWith( DOMPurify.sanitize(content) )',
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
						messageId: 'after',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).after( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).append( content )',
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).append( DOMPurify.sanitize(content) )',
			},
			{
				code: '$( \'body\' ).appendTo( userInput )',
				errors: [
					{
						messageId: 'appendTo',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).appendTo( DOMPurify.sanitize(userInput) )',
			},
			{
				code: '$( \'body\' ).before( arbitrary )',
				errors: [
					{
						messageId: 'before',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).before( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).html( userInput )',
				errors: [
					{
						messageId: 'html',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).html( DOMPurify.sanitize(userInput) )',
			},
			{
				code: '$( \'body\' ).insertAfter( content )',
				errors: [
					{
						messageId: 'insertAfter',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).insertAfter( DOMPurify.sanitize(content) )',
			},
			{
				code: '$( \'body\' ).insertBefore( userInput )',
				errors: [
					{
						messageId: 'insertBefore',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).insertBefore( DOMPurify.sanitize(userInput) )',
			},
			{
				code: '$( \'body\' ).prepend( arbitrary )',
				errors: [
					{
						messageId: 'prepend',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).prepend( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).prependTo( content )',
				errors: [
					{
						messageId: 'prependTo',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).prependTo( DOMPurify.sanitize(content) )',
			},
			{
				code: '$( \'body\' ).replaceAll( userInput )',
				errors: [
					{
						messageId: 'replaceAll',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).replaceAll( DOMPurify.sanitize(userInput) )',
			},
			{
				code: '$( \'body\' ).replaceWith( arbitrary )',
				errors: [
					{
						messageId: 'replaceWith',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: '$( \'body\' ).replaceWith( DOMPurify.sanitize(arbitrary) )',
			},
		],
	} );
} );

describe( 'Dangerously Set Inner HTML', () => {
	ruleTester.run( 'dangerously-set-inner-html', dangerouslySetInnerHtmlRule, {
		valid: [
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: sanitize(arbitrary)}} /></div>',
			},
		],
		invalid: [
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: arbitrary}} /></div>',
				errors: [
					{
						messageId: 'dangerousInnerHtml',
						type: AST_NODE_TYPES.JSXAttribute,
					},
				],
				output: '() => <div><div dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(arbitrary)}} /></div>',
			},
		],
	} );
} );

describe( 'HTML Executing Function', () => {
	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [
			// Document methods with sanitization
			{
				code: 'document.write( sanitize(content) )',
			},
			{
				code: 'document.writeln( DOMPurify.sanitize(arbitrary) )',
			},
			// Element methods with sanitization
			{
				code: 'element.after( sanitize(content) )',
			},
			{
				code: 'element.append( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: 'element.before( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: 'element.prepend( sanitize(content) )',
			},
			{
				code: 'element.replaceWith( DOMPurify.sanitize(arbitrary) )',
			},
			// Passing an element.
			{
				code: 'const foo = document.getElementById( "foo" ); element.after( foo )',
			},
			{
				code: 'const passElement: HTMLBodyElement = document.getElementById( "body" ) as HTMLBodyElement; element.before( passElement )',
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
					},
				],
				output: 'document.write( DOMPurify.sanitize(userInput) )',
			},
			{
				code: 'document.writeln( arbitrary )',
				errors: [
					{
						messageId: 'document.writeln',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'document.writeln( DOMPurify.sanitize(arbitrary) )',
			},
			// Element methods without sanitization
			{
				code: 'element.after( userInput )',
				errors: [
					{
						messageId: 'after',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'element.after( DOMPurify.sanitize(userInput) )',
			},
			{
				code: 'element.append( content )',
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'element.append( DOMPurify.sanitize(content) )',
			},
			{
				code: 'element.before( content )',
				errors: [
					{
						messageId: 'before',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'element.before( DOMPurify.sanitize(content) )',
			},
			{
				code: 'element.prepend( userInput )',
				errors: [
					{
						messageId: 'prepend',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'element.prepend( DOMPurify.sanitize(userInput) )',
			},
			{
				code: 'element.replaceWith( content )',
				errors: [
					{
						messageId: 'replaceWith',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
				output: 'element.replaceWith( DOMPurify.sanitize(content) )',
			},
		],
	} );
} );
