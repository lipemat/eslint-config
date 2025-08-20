import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';

type Context = TSESLint.RuleContext<'htmlStringConcat', []>;

function isStringConcat( node: TSESTree.CallExpressionArgument ): boolean {
	// 'foo' + userInput + 'bar' (HTML-like only)
	return AST_NODE_TYPES.BinaryExpression === node.type && '+' === node.operator && hasHtmlLikeStrings( node );
}


function hasHtmlLikeStrings( node: TSESTree.Expression | TSESTree.PrivateIdentifier ): boolean {
	if ( AST_NODE_TYPES.Literal === node.type && 'string' === typeof node.value ) {
		return /[<>]/.test( node.value );
	}
	if ( AST_NODE_TYPES.TemplateLiteral === node.type ) {
		// Check any static part of the template for HTML-like content.
		return node.quasis.some( q => /[<>]/.test( q.value.cooked ) );
	}
	if ( AST_NODE_TYPES.BinaryExpression === node.type && '+' === node.operator ) {
		return hasHtmlLikeStrings( node.left ) || hasHtmlLikeStrings( node.right );
	}
	return false;
}


const plugin: TSESLint.RuleModule<'htmlStringConcat'> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow string concatenation with HTML-like content',
		},
		messages: {
			htmlStringConcat: 'HTML string concatenation detected, this is a security risk, use DOM node construction or a templating language instead.',
		},
		schema: [],
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			AssignmentExpression( node: TSESTree.AssignmentExpression ) {
				const right: TSESTree.Expression = node.right;
				if ( isStringConcat( right ) ) {
					context.report( {
						node,
						messageId: 'htmlStringConcat',
					} );
				}
			},

			VariableDeclarator( node: TSESTree.VariableDeclarator ) {
				// Detect string concatenation assigned at declaration time
				const init = node.init;
				if ( null === init ) {
					return;
				}
				if ( isStringConcat( init ) ) {
					context.report( {
						node,
						messageId: 'htmlStringConcat',
					} );
				}
			},
		};
	},
};

export default plugin;
