import type {CallExpressionArgument, Expression} from '@typescript-eslint/types/dist/generated/ast-spec';
import {AST_NODE_TYPES} from '@typescript-eslint/utils';


export function isSanitized( node: Expression | CallExpressionArgument ): boolean {
	return ( AST_NODE_TYPES.CallExpression === node.type &&
		(
			( AST_NODE_TYPES.Identifier === node.callee.type && 'sanitize' === node.callee.name ) ||
			( AST_NODE_TYPES.MemberExpression === node.callee.type &&
				'object' in node.callee &&
				(
					( AST_NODE_TYPES.Identifier === node.callee.object.type && 'dompurify' === String( node.callee.object.name ).toLowerCase() )
				) &&
				'name' in node.callee.property && 'sanitize' === node.callee.property.name )
		)
	);
}
