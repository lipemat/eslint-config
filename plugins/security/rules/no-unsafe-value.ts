import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';

type Context = TSESLint.RuleContext<'stringArgument', []>;

const plugin: TSESLint.RuleModule<'stringArgument'> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		docs: {
			description: 'Disallow using unsanitized values in sensitive sinks (DOM, navigation, etc)',
		},
		messages: {
			stringArgument: '${calleeName} should not receive a string. Pass a function instead.',
		},
		schema: [],
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: TSESTree.CallExpression ) {
				// document.write, eval, setTimeout, setInterval
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

				// Special-case timers: only unsafe when a string is passed (evaluated as code).
				if ( 'setTimeout' === calleeName || 'setInterval' === calleeName ) {
					const arg: TSESTree.CallExpressionArgument = node.arguments[ 0 ];
					const isFunctionArg = (
						AST_NODE_TYPES.FunctionExpression === arg.type || AST_NODE_TYPES.ArrowFunctionExpression === arg.type || AST_NODE_TYPES.Identifier === arg.type
					);
					if ( ! isFunctionArg ) {
						const isStringy = (
							( AST_NODE_TYPES.Literal === arg.type && 'string' === typeof arg.value ) ||
							AST_NODE_TYPES.TemplateLiteral === arg.type
						);
						if ( isStringy ) {
							context.report( {
								node,
								messageId: 'stringArgument',
								data: {
									calleeName,
								},
							} );
						}
					}
				}
			},
		};
	},
};

export default plugin;
