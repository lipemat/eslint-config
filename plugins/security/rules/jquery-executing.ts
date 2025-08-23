import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import type {Type} from 'typescript';
import {isSanitized} from '../helpers/dom-purify.js';
import {getType} from '../helpers/ts-types.js';

type UnsafeCalls =
	'after'
	| 'append'
	| 'appendTo'
	| 'before'
	| 'html'
	| 'insertAfter'
	| 'insertBefore'
	| 'prepend'
	| 'prependTo'
	| 'replaceAll'
	| 'replaceWith';

type Messages = 'needsEscaping' | 'sanitize' | 'domPurify';
type Context = TSESLint.RuleContext<Messages, []>;


/**
 * @link https://docs.wpvip.com/security/javascript-security-recommendations/#h-stripping-tags
 */
const JQUERY_METHODS: UnsafeCalls[] = [
	'after', 'append', 'appendTo', 'before', 'html',
	'insertAfter', 'insertBefore', 'prepend', 'prependTo',
	'replaceAll', 'replaceWith',
];

/**
 * Is the type of variable being passed a jQuery element?
 *
 * - jQuery elements are of type `JQuery`.
 * - jQuery elements do not require sanitization.
 *
 * @link https://typescript-eslint.io/developers/custom-rules/#typed-rules
 */
export function isJQueryElementType( arg: TSESTree.CallExpressionArgument, context: Context ): boolean {
	const element: Type = getType<Context>( arg, context );
	return 'JQuery' === element.getSymbol()?.escapedName;
}


function isJQueryMethod( methodName: string ): methodName is UnsafeCalls {
	return JQUERY_METHODS.includes( methodName as UnsafeCalls );
}

export function isJQueryCall( node: TSESTree.CallExpression ): boolean {
	if ( AST_NODE_TYPES.MemberExpression !== node.callee.type || ! ( 'name' in node.callee.property ) ) {
		return false;
	}
	// Walk to the root object of the call chain
	let obj = node.callee.object ?? null;
	if ( null === obj ) {
		return false;
	}
	while ( AST_NODE_TYPES.MemberExpression === obj.type ) {
		obj = obj.object;
	}
	return ( AST_NODE_TYPES.CallExpression === obj.type && AST_NODE_TYPES.Identifier === obj.callee.type &&
		( '$' === obj.callee.name || 'jQuery' === obj.callee.name )
	);
}


export function getJQueryCall( node: TSESTree.CallExpression ): UnsafeCalls | null {
	// Detect $(...).method(userInput) or jQuery(...).method(...)
	if ( AST_NODE_TYPES.MemberExpression !== node.callee.type || ! ( 'name' in node.callee.property ) ) {
		return null;
	}
	const methodName = node.callee.property.name;
	if ( ! isJQueryMethod( methodName ) ) {
		return null;
	}
	return isJQueryCall( node ) ? methodName : null;
}

const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in jQuery methods that execute HTML',
		},
		hasSuggestions: true,
		messages: {
			needsEscaping: 'Any HTML used with `{{methodName}}` gets executed. Make sure it\'s properly escaped.',

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
				const methodName = getJQueryCall( node );
				if ( null !== methodName ) {
					const arg: TSESTree.CallExpressionArgument = node.arguments[ 0 ];
					if ( ! isSanitized( arg ) && ! isJQueryElementType( arg, context ) ) {
						context.report( {
							node,
							messageId: 'needsEscaping',
							data: {
								methodName,
							},
							suggest: [
								{
									messageId: 'domPurify',
									fix: ( fixer: TSESLint.RuleFixer ) => {
										const argText = context.sourceCode.getText( arg );
										return fixer.replaceText( arg, `DOMPurify.sanitize( ${argText} )` );
									},
								},
								{
									messageId: 'sanitize',
									fix: ( fixer: TSESLint.RuleFixer ) => {
										const argText = context.sourceCode.getText( arg );
										return fixer.replaceText( arg, `sanitize( ${argText} )` );
									},
								},
							],
						} );
					}
				}
			},
		};
	},
};

export default plugin;
