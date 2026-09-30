import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';

type Messages = 'nullish' | 'ternary';

type Context = TSESLint.RuleContext<Messages, []>;

const CONDITIONAL_TYPES: AST_NODE_TYPES[] = [
	AST_NODE_TYPES.ConditionalExpression,
	AST_NODE_TYPES.DoWhileStatement,
	AST_NODE_TYPES.ForStatement,
	AST_NODE_TYPES.IfStatement,
	AST_NODE_TYPES.WhileStatement,
];

/**
 * Is the node anywhere within the `test` of a conditional, including nested callbacks?
 */
export function isWithinCondition( node: TSESTree.Node ): boolean {
	let child: TSESTree.Node = node;
	while ( AST_NODE_TYPES.Program !== child.type ) {
		const parent: TSESTree.Node = child.parent;
		if ( CONDITIONAL_TYPES.includes( parent.type ) && 'test' in parent && child === parent.test ) {
			return true;
		}
		child = parent;
	}
	return false;
}

const plugin: TSESLint.RuleModule<Messages> = {
	meta: {
		type: 'suggestion',
		docs: {
			description: 'Disallow nullish coalescing and ternaries within conditions',
		},
		messages: {
			nullish: 'Assign the nullish coalesced value to a variable before using it in a condition.',
			ternary: 'Assign the ternary result to a variable before using it in a condition.',
		},
		schema: [],
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			'LogicalExpression[operator="??"]'( node: TSESTree.LogicalExpression ) {
				if ( isWithinCondition( node ) ) {
					context.report( {
						node,
						messageId: 'nullish',
					} );
				}
			},

			ConditionalExpression( node: TSESTree.ConditionalExpression ) {
				if ( isWithinCondition( node ) ) {
					context.report( {
						node,
						messageId: 'ternary',
					} );
				}
			},
		};
	},
};

export default plugin;
