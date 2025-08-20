import type {CallExpressionArgument, Expression} from '@typescript-eslint/types/dist/generated/ast-spec';
import {AST_NODE_TYPES} from '@typescript-eslint/utils';

/**
 * Check if a node is a call to a known sanitization function.
 * - Currently recognizes `sanitize(...)` and `DOMPurify.sanitize(...)`.
 */
export function isSanitized( node: Expression | CallExpressionArgument ): boolean {
	if ( AST_NODE_TYPES.CallExpression !== node.type ) {
		return false;
	}
	if ( AST_NODE_TYPES.Identifier === node.callee.type && 'sanitize' === node.callee.name ) {
		return true;
	}
	if ( AST_NODE_TYPES.MemberExpression === node.callee.type &&
		'object' in node.callee && AST_NODE_TYPES.Identifier === node.callee.object.type ) {
		return 'dompurify' === node.callee.object.name.toLowerCase() &&
			'name' in node.callee.property && 'sanitize' === node.callee.property.name;
	}
	return false;
}
