import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isDomElementType, isSanitized} from '../utils/shared.js';
import {isJQueryCall} from './jquery-executing.js';

type HtmlExecutingFunctions = 'document.write' | 'document.writeln';

type UnsafeCalls =
	'after'
	| 'append'
	| 'before'
	| 'insertAdjacentHTML'
	| 'prepend'
	| 'replaceWith'
	| 'setAttribute';


type Messages = HtmlExecutingFunctions | UnsafeCalls | 'sanitize' | 'domPurify';
type Context = TSESLint.RuleContext<Messages, []>;


const DOCUMENT_METHODS: HtmlExecutingFunctions[] = [
	'document.write',
	'document.writeln',
];

const SECOND_ARG_METHODS = new Set<UnsafeCalls>( [
	'insertAdjacentHTML',
	'setAttribute',
] );

const UNSAFE_METHODS = [
	'after', 'append', 'before', 'insertAdjacentHTML', 'prepend', 'replaceWith', 'setAttribute',
] as const satisfies readonly UnsafeCalls[];

function isDocumentMethod( methodName: string ): methodName is HtmlExecutingFunctions {
	return DOCUMENT_METHODS.includes( methodName as HtmlExecutingFunctions );
}

function isUnsafeMethod( methodName: string ): methodName is UnsafeCalls {
	return UNSAFE_METHODS.includes( methodName as UnsafeCalls );
}

function isSecondArgMethod( methodName: string ): methodName is UnsafeCalls {
	return SECOND_ARG_METHODS.has( methodName as UnsafeCalls );
}


function getDocumentCall( node: TSESTree.CallExpression ): HtmlExecutingFunctions | null {
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


function getElementMethodCall( node: TSESTree.CallExpression ): UnsafeCalls | null {
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


const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in functions that execute HTML',
		},
		fixable: 'code',
		hasSuggestions: true,
		messages: {
			'document.write': 'Any HTML used with `document.write` gets executed. Make sure it\'s properly escaped.',
			'document.writeln': 'Any HTML used with `document.writeln` gets executed. Make sure it\'s properly escaped.',
			after: 'Any HTML used with `after` gets executed. Make sure it\'s properly escaped.',
			append: 'Any HTML used with `append` gets executed. Make sure it\'s properly escaped.',
			before: 'Any HTML used with `before` gets executed. Make sure it\'s properly escaped.',
			insertAdjacentHTML: 'Any HTML used with `insertAdjacentHTML` gets executed. Make sure it\'s properly escaped.',
			prepend: 'Any HTML used with `prepend` gets executed. Make sure it\'s properly escaped.',
			replaceWith: 'Any HTML used with `replaceWith` gets executed. Make sure it\'s properly escaped.',
			setAttribute: 'Any HTML used with `setAttribute` can lead to XSS. Make sure it\'s properly escaped.',

			// Suggestions
			domPurify: 'Wrap the argument with a `DOMPurify.sanitize()` call.',
			sanitize: 'Wrap the argument with a `sanitize()` call.',
		},
		schema: [],
		type: 'problem',

	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: TSESTree.CallExpression ) {
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

				let arg: TSESTree.CallExpressionArgument = node.arguments[ 0 ];
				if ( isSecondArgMethod( method ) ) {
					arg = node.arguments[ 1 ];
				}

				if ( ! isSanitized( arg ) && ! isDomElementType<Context>( arg, context ) ) {
					context.report( {
						node,
						messageId: method,
						suggest: [
							{
								messageId: 'domPurify',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( arg );
									return fixer.replaceText( arg, `DOMPurify.sanitize(${argText})` );
								},
							},
							{
								messageId: 'sanitize',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( arg );
									return fixer.replaceText( arg, `sanitize(${argText})` );
								},
							},
						],
					} );
				}
			},
		};
	},
};

export default plugin;
