import {AST_NODE_TYPES, type TSESLint} from '@typescript-eslint/utils';
import type {CallExpression, CallExpressionArgument} from '@typescript-eslint/types/dist/generated/ast-spec';
import {isDomElementType, isSanitized} from '../utils/shared.js';
import {isJQueryCall} from './jquery-executing.js';

type HtmlExecutingFunctions =
	'document.write' | 'document.writeln';


type UnsafeCalls =
	'after'
	| 'append'
	| 'before'
	| 'prepend'
	| 'replaceWith';

type Context = TSESLint.RuleContext<HtmlExecutingFunctions | UnsafeCalls, []>;

const DOCUMENT_METHODS: HtmlExecutingFunctions[] = [
	'document.write',
	'document.writeln',
];

const UNSAFE_METHODS: UnsafeCalls[] = [
	'after', 'append', 'before', 'prepend', 'replaceWith',
];

function isDocumentMethod( methodName: string ): methodName is HtmlExecutingFunctions {
	return DOCUMENT_METHODS.includes( methodName as HtmlExecutingFunctions );
}

function isUnsafeMethod( methodName: string ): methodName is UnsafeCalls {
	return UNSAFE_METHODS.includes( methodName as UnsafeCalls );
}


function getDocumentCall( node: CallExpression ): HtmlExecutingFunctions | null {
	let calleeName = '';
	if ( AST_NODE_TYPES.Identifier === node.callee.type ) {
		calleeName = node.callee.name;
	} else if ( AST_NODE_TYPES.MemberExpression === node.callee.type ) {
		if ( 'name' in node.callee.object ) {
			calleeName = node.callee.object.name;
			if ( 'name' in node.callee.property ) {
				calleeName += '.' + node.callee.property.name;
			}
		} else if ( 'name' in node.callee.property ) {
			calleeName = node.callee.property.name;
		}
	}
	if ( isDocumentMethod( calleeName ) ) {
		return calleeName;
	}

	return null;
}


function getElementMethodCall( node: CallExpression ): UnsafeCalls | null {
	// Detect element.method(userInput) calls
	if ( AST_NODE_TYPES.MemberExpression !== node.callee.type || ! ( 'name' in node.callee.property ) ) {
		return null;
	}
	const methodName = node.callee.property.name;
	if ( ! isUnsafeMethod( methodName ) ) {
		return null;
	}
	if ( isJQueryCall( node ) ) {
		return null; // Handled in jquery-executing rule
	}
	// This is a generic element method call, not jQuery specific
	return methodName;
}


const plugin: TSESLint.RuleModule<HtmlExecutingFunctions | UnsafeCalls> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in functions that execute HTML',
		},
		fixable: 'code',
		messages: {
			'document.write': 'Any HTML used with `document.write` gets executed. Make sure it\'s properly escaped.',
			'document.writeln': 'Any HTML used with `document.writeln` gets executed. Make sure it\'s properly escaped.',
			after: 'Any HTML used with `after` gets executed. Make sure it\'s properly escaped.',
			append: 'Any HTML used with `append` gets executed. Make sure it\'s properly escaped.',
			before: 'Any HTML used with `before` gets executed. Make sure it\'s properly escaped.',
			prepend: 'Any HTML used with `prepend` gets executed. Make sure it\'s properly escaped.',
			replaceWith: 'Any HTML used with `replaceWith` gets executed. Make sure it\'s properly escaped.',
		},
		schema: [],
		type: 'problem',

	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: CallExpression ) {
				let method: HtmlExecutingFunctions | UnsafeCalls | null;
				const documentMethod = getDocumentCall( node );

				if ( null !== documentMethod ) {
					method = documentMethod;
				} else {
					method = getElementMethodCall( node );
					if ( null === method ) {
						return;
					}
				}

				const arg: CallExpressionArgument = node.arguments[ 0 ];
				if ( ! isSanitized( arg ) && ! isDomElementType<Context>( arg, context ) ) {
					context.report( {
						node,
						messageId: method,
						fix: ( fixer: TSESLint.RuleFixer ) => {
							const argText = context.sourceCode.getText( arg );
							return fixer.replaceText( arg, `DOMPurify.sanitize(${argText})` );
						},
					} );
				}
			},
		};
	},
};

export default plugin;
