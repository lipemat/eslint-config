import ruleTester from '../../../helpers/rule-tester';
import htmlExecutingAssignmentRule from '../../../../plugins/security/rules/html-executing-assignment';
import {AST_NODE_TYPES} from '@typescript-eslint/utils';

/**
 * Test isolation for the html-executing-assignment rule
 *
 * Most of the cases are covered by the @lipemat-rules.test.ts tests.
 * - Add new tests here for specific html-executing-assignment rule cases.
 */


describe( 'Not DOM element', () => {
	ruleTester.run( 'html-executing-assignment', htmlExecutingAssignmentRule, {
		valid: [
			{
				code: 'const notElement = {}; notElement.innerHTML = content',
			},
			{
				code: 'anotherFunction().outerHtml = userInput',
			},

		],
		invalid: [],
	} );
} );


describe( 'Unescaped DOM element', () => {
	ruleTester.run( 'html-executing-assignment', htmlExecutingAssignmentRule, {
		valid: [],
		invalid: [
			{
				code: 'const el = document.querySelector( "foo" );' +
					'el.innerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'innerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
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
				} ],
			},
			{
				code: 'const el = document.getElementById( "foo" );' +
					'el.outerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'outerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
					suggestions: [
						{
							messageId: 'domPurify',
							output: 'const el = document.getElementById( "foo" );el.outerHTML = DOMPurify.sanitize( userInput )',
						},
						{
							messageId: 'sanitize',
							output: 'const el = document.getElementById( "foo" );el.outerHTML = sanitize( userInput )',
						},
					],
				} ],
			},
			{
				code: 'const el = document.createElement( "div" );' +
					'el.innerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'innerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
					suggestions: [
						{
							messageId: 'domPurify',
							output: 'const el = document.createElement( "div" );el.innerHTML = DOMPurify.sanitize( userInput )',
						},
						{
							messageId: 'sanitize',
							output: 'const el = document.createElement( "div" );el.innerHTML = sanitize( userInput )',
						},
					],
				} ],
			},
			{
				code: 'const el = document.body;' +
					'el.outerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'outerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
					suggestions: [
						{
							messageId: 'domPurify',
							output: 'const el = document.body;el.outerHTML = DOMPurify.sanitize( userInput )',
						},
						{
							messageId: 'sanitize',
							output: 'const el = document.body;el.outerHTML = sanitize( userInput )',
						},
					],
				} ],
			},
			{
				code: 'document.body.innerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'innerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
					suggestions: [
						{
							messageId: 'domPurify',
							output: 'document.body.innerHTML = DOMPurify.sanitize( userInput )',
						},
						{
							messageId: 'sanitize',
							output: 'document.body.innerHTML = sanitize( userInput )',
						},
					],
				} ],
			},
			{
				code: 'document.head.outerHTML = userInput',
				errors: [ {
					messageId: 'executed',
					data: {propertyName: 'outerHTML'},
					type: AST_NODE_TYPES.AssignmentExpression,
					suggestions: [
						{
							messageId: 'domPurify',
							output: 'document.head.outerHTML = DOMPurify.sanitize( userInput )',
						},
						{
							messageId: 'sanitize',
							output: 'document.head.outerHTML = sanitize( userInput )',
						},
					],
				} ],
			},
		],
	} );
} );
