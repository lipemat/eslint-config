import jestRunnerEslint from '../helpers/jest-runner-eslint';
import {RuleTester} from '@typescript-eslint/rule-tester';
import noUnsafeValueRule from '../../plugins/security/rules/no-unsafe-value';
import dangerouslySetInnerHtmlRule from '../../plugins/security/rules/dangerously-set-inner-html';
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
				code: '$( \'body\' ).after( sanitize(arbitrary) )',
			},
			{
				code: '$( \'body\' ).after( DOMPurify.sanitize(arbitrary) )',
			},
			{
				code: 'document.getElementById( \'body\' ).innerHTML = sanitize(arbitrary)',
			},
		],
		invalid: [
			{
				code: '$( \'body\' ).after( arbitrary )',
				errors: [
					{
						message: 'Any HTML passed to `after` gets executed. Make sure it\'s properly escaped.',
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
} );
