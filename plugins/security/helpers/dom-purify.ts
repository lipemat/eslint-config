import {AST_NODE_TYPES, type TSESTree} from '@typescript-eslint/utils';
import type ESTree from 'estree';

/**
 * Check if a node is a call to a known sanitization function.
 * - Currently recognizes `sanitize(...)` and `DOMPurify.sanitize(...)`.
 */
export function isSanitized( node: ESTree.Expression | TSESTree.Property['value'] | TSESTree.CallExpressionArgument ): boolean {
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
