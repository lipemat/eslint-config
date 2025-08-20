import jestRunnerEslint from '../helpers/jest-runner-eslint';
import {RuleTester} from '@typescript-eslint/rule-tester';
import noUnsafeValueRule from '../../plugins/security/rules/no-unsafe-value';
import dangerouslySetInnerHtmlRule from '../../plugins/security/rules/dangerously-set-inner-html';
import jqueryExecutingRule from '../../plugins/security/rules/jquery-executing';
import htmlExecutingFunctionRule from '../../plugins/security/rules/html-executing-function';
import parser from '@typescript-eslint/parser';
import {AST_NODE_TYPES} from '@typescript-eslint/types';

describe( '@lipemat rules are enabled', () => {
	test( '@lipemat/no-unsafe-value failing', async () => {
		expect( await jestRunnerEslint( 'failing/@lipemat/security' ) ).toMatchSnapshot();
	} );
} );

describe( 'Individual rules', () => {
	const ruleTester = new RuleTester( {
		languageOptions: {
			parser,
			parserOptions: {
				ecmaFeatures: {
					jsx: true,
				},
			},
		},
	} );
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
			},
			{
				code: '$( \'body\' ).append( content )',
				errors: [
					{
						messageId: 'append',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).appendTo( userInput )',
				errors: [
					{
						messageId: 'appendTo',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).before( arbitrary )',
				errors: [
					{
						messageId: 'before',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).html( userInput )',
				errors: [
					{
						messageId: 'html',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).insertAfter( content )',
				errors: [
					{
						messageId: 'insertAfter',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).insertBefore( userInput )',
				errors: [
					{
						messageId: 'insertBefore',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).prepend( arbitrary )',
				errors: [
					{
						messageId: 'prepend',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).prependTo( content )',
				errors: [
					{
						messageId: 'prependTo',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).replaceAll( userInput )',
				errors: [
					{
						messageId: 'replaceAll',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
			{
				code: '$( \'body\' ).replaceWith( arbitrary )',
				errors: [
					{
						messageId: 'replaceWith',
						type: AST_NODE_TYPES.CallExpression,
					},
				],
			},
		],
	} );

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

	ruleTester.run( 'html-executing-function', htmlExecutingFunctionRule, {
		valid: [
			// Document methods with sanitization
			{
				code: 'document.write( sanitize(content) )',
			},
			{
				code: 'document.writeln( DOMPurify.sanitize(arbitrary) )',
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
		],
	} );
} );
