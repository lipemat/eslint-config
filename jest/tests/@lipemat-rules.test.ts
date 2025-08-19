import jestRunnerEslint from '../helpers/jest-runner-eslint';
import {RuleTester} from '@typescript-eslint/rule-tester';
import rule from '../../plugins/security/rules/no-unsafe-value';
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
	ruleTester.run( 'no-unsafe-value', rule, {
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
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: sanitize(arbitrary)}} /></div>',
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
			{
				code: '() => <div><div dangerouslySetInnerHTML={{__html: arbitrary}} /></div>',
				errors: [
					{
						messageId: 'dangerousInnerHtml',
						type: AST_NODE_TYPES.JSXAttribute,
					},
				],
			},
		],
	} );
} );
