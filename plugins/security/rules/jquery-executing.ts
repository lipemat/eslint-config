import {AST_NODE_TYPES, ESLintUtils, type TSESLint} from '@typescript-eslint/utils';
import type {CallExpression, CallExpressionArgument} from '@typescript-eslint/types/dist/generated/ast-spec';
import {isSanitized} from '../utils/shared.js';
import type {Type} from 'typescript';

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

type Context = TSESLint.RuleContext<UnsafeCalls, []>;

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
export function isJQueryElementType( arg: CallExpressionArgument, context: Context ): boolean {
	const {getTypeAtLocation} = ESLintUtils.getParserServices( context );
	const type = getTypeAtLocation( arg );
	const element: Type = type.getNonNullableType();
	return 'JQuery' === element.getSymbol()?.escapedName;
}


function isJQueryMethod( methodName: string ): methodName is UnsafeCalls {
	return JQUERY_METHODS.includes( methodName as UnsafeCalls );
}

export function isJQueryCall( node: CallExpression ): boolean {
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


function getJQueryCall( node: CallExpression ): UnsafeCalls | null {
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

const plugin: TSESLint.RuleModule<UnsafeCalls> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in jQuery methods that execute HTML',
		},
		fixable: 'code',
		messages: {
			after: 'Any HTML used with `after` gets executed. Make sure it\'s properly escaped.',
			append: 'Any HTML used with `append` gets executed. Make sure it\'s properly escaped.',
			appendTo: 'Any HTML used with `appendTo` gets executed. Make sure it\'s properly escaped.',
			before: 'Any HTML used with `before` gets executed. Make sure it\'s properly escaped.',
			html: 'Any HTML used with `html` gets executed. Make sure it\'s properly escaped.',
			insertAfter: 'Any HTML used with `insertAfter` gets executed. Make sure it\'s properly escaped.',
			insertBefore: 'Any HTML used with `insertBefore` gets executed. Make sure it\'s properly escaped.',
			prepend: 'Any HTML used with `prepend` gets executed. Make sure it\'s properly escaped.',
			prependTo: 'Any HTML used with `prependTo` gets executed. Make sure it\'s properly escaped.',
			replaceAll: 'Any HTML used with `replaceAll` gets executed. Make sure it\'s properly escaped.',
			replaceWith: 'Any HTML used with `replaceWith` gets executed. Make sure it\'s properly escaped.',
		},
		schema: [],
		type: 'problem',
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: CallExpression ) {
				const methodName = getJQueryCall( node );
				if ( null !== methodName ) {
					const arg: CallExpressionArgument = node.arguments[ 0 ];
					if ( ! isSanitized( arg ) && ! isJQueryElementType( arg, context ) ) {
						context.report( {
							node,
							messageId: methodName,
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( arg );
								return fixer.replaceText( arg, `DOMPurify.sanitize(${argText})` );
							},
						} );
					}
				}
			},
		};
	},
};

export default plugin;
