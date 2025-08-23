import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';

import {getType} from './ts-types.js';

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
