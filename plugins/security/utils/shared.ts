import {AST_NODE_TYPES, ESLintUtils, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {type Type} from 'typescript';

/**
 * Is the node of type string.
 * - String literals.
 * - constants of type string.
 * - template literals.
 * - intrinsic type string.
 */
export function isStringLike( node: TSESTree.CallExpressionArgument, context: Readonly<TSESLint.RuleContext<string, readonly []>> ): boolean {
	const type = getType( node, context );
	const literal = type.isStringLiteral();
	const intrinsic = 'intrinsicName' in type && 'string' === type.intrinsicName;
	return ( AST_NODE_TYPES.Literal === node.type && 'string' === typeof node.value ) || ( AST_NODE_TYPES.TemplateLiteral === node.type ) || literal || intrinsic;
}


/**
 * Get the TypeScript type of node.
 */
export function getType<Context extends Readonly<TSESLint.RuleContext<string, readonly []>>>( expression: TSESTree.CallExpressionArgument, context: Context ): Type {
	const {getTypeAtLocation} = ESLintUtils.getParserServices( context );
	const type = getTypeAtLocation( expression );
	return type.getNonNullableType();
}


/**
 * Is the type of variable being passed a DOM element?
 *
 * - DOM elements are of the type `HTML{*}Element`.
 * - DOM elements do not require sanitization.
 *
 * @link https://typescript-eslint.io/developers/custom-rules/#typed-rules
 */
export function isDomElementType<Context extends Readonly<TSESLint.RuleContext<string, readonly []>>>( expression: TSESTree.CallExpressionArgument, context: Context ): boolean {
	const type: Type = getType<Context>( expression, context );

	const name = type.getSymbol()?.escapedName ?? '';
	// Match any type that ends with "Element", e.g., HTMLElement, HTMLDivElement, Element, etc.
	if ( 'Element' === name ) {
		return true;
	}
	return name.startsWith( 'HTML' ) && name.endsWith( 'Element' );
}


/**
 * Check if a node is a call to a known sanitization function.
 * - Currently recognizes `sanitize(...)` and `DOMPurify.sanitize(...)`.
 */
export function isSanitized( node: TSESTree.Property['value'] | TSESTree.CallExpressionArgument ): boolean {
	if ( AST_NODE_TYPES.CallExpression !== node.type ) {
		return false;
	}
	if ( AST_NODE_TYPES.Identifier === node.callee.type && 'sanitize' === node.callee.name ) {
		return true;
	}

	if ( AST_NODE_TYPES.MemberExpression === node.callee.type && AST_NODE_TYPES.Identifier === node.callee.object.type ) {
		return 'dompurify' === node.callee.object.name.toLowerCase() &&
			AST_NODE_TYPES.Identifier === node.callee.property.type && 'sanitize' === node.callee.property.name;
	}
	return false;
}


/**
 * Check if a node is a literal string
 */
export function isLiteralString( node: TSESTree.Property['value'] | TSESTree.CallExpressionArgument ): node is TSESTree.StringLiteral {
	return AST_NODE_TYPES.Literal === node.type && 'string' === typeof node.value;
}


/**
 * Check if a node is a literal string that is safe to use in an HTML context.
 * - Must be a literal string. Or a conditional expression where both branches are safe literal strings.
 * - Must not contain `<script`.
 * - Must not start with a dangerous protocol (javascript:, data:, vbscript:, about:, livescript:).
 */
export function isSafeLiteralString( node: TSESTree.Property['value'] | TSESTree.CallExpressionArgument ): boolean {
	if ( AST_NODE_TYPES.ConditionalExpression === node.type ) {
		return isSafeLiteralString( node.consequent ) && isSafeLiteralString( node.alternate );
	}

	if ( ! isLiteralString( node ) ) {
		return false;
	}
	if ( node.value.includes( '<script' ) ) {
		return false;
	}
	return ! /^\s*(?:javascript|data|vbscript|about|livescript)\s*:/i.test( decodeURIComponent( node.value.replace( /[\u0000-\u001F\u007F]+/g, '' ) ) );
}
