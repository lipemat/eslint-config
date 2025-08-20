import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isSanitized} from '../utils/shared.js';

type Context = TSESLint.RuleContext<'stringArgument', []>;

// Sinks: property assignments and function calls
const SENSITIVE_PROPS = [ 'href', 'src', 'action',
	'protocol', 'host', 'hostname', 'pathname', 'search', 'hash', 'username', 'port', 'name', 'status',
];
const URL_PROPS = new Set( [ 'href', 'src', 'action', 'protocol', 'host', 'hostname', 'pathname', 'search', 'hash', 'username', 'port' ] );


function isSafeUrlLiteral( node: TSESTree.Expression ): boolean {
	return ( AST_NODE_TYPES.Literal === node.type && 'string' === typeof node.value &&
		! /^(javascript:)/i.test( node.value )
	);
}


function isAllExpressionsEncoded( templateNode: TSESTree.Expression ): boolean {
	if ( AST_NODE_TYPES.TemplateLiteral !== templateNode.type ) {
		return false;
	}
	return Array.isArray( templateNode.expressions ) && templateNode.expressions.length > 0 && templateNode.expressions.every( expr => (
		AST_NODE_TYPES.CallExpression === expr.type &&
		AST_NODE_TYPES.Identifier === expr.callee.type &&
		( 'encodeURIComponent' === expr.callee.name || 'encodeURI' === expr.callee.name )
	) );
}


function isSafeUrlTemplate( node: TSESTree.Expression ): boolean {
	if ( AST_NODE_TYPES.TemplateLiteral !== node.type || 0 === node.quasis.length ) {
		return false;
	}
	// Basic scheme safety on the first static chunk
	const firstChunk = node.quasis[ 0 ].value.cooked;
	if ( /^javascript:/i.test( firstChunk ) ) {
		return false;
	}
	return isAllExpressionsEncoded( node );
}


function isWindowLocationAssignment( node: TSESTree.AssignmentExpression ): boolean {
	// window.location.<prop> = ...
	return (
		AST_NODE_TYPES.MemberExpression === node.left.type &&
		AST_NODE_TYPES.MemberExpression === node.left.object.type &&
		'name' in node.left.object.object &&
		'name' in node.left.object.property &&
		'name' in node.left.property &&
		'window' === node.left.object.object.name &&
		'location' === node.left.object.property.name &&
		SENSITIVE_PROPS.includes( node.left.property.name )
	);
}


function isWindowAssignment( node: TSESTree.AssignmentExpression ) {
	// window.<prop> = ...
	return (
		AST_NODE_TYPES.MemberExpression === node.left.type &&
		'name' in node.left.object &&
		'name' in node.left.property &&
		'window' === node.left.object.name &&
		SENSITIVE_PROPS.includes( node.left.property.name )
	);
}

function isWindowOrLocationMemberExpression( memberExpr: TSESTree.MemberExpression ): boolean {
	// Helper to detect window.* or window.location.*
	if ( AST_NODE_TYPES.MemberExpression !== memberExpr.type ) {
		return false;
	}
	if ( AST_NODE_TYPES.Identifier === memberExpr.object.type && 'window' === memberExpr.object.name ) {
		return true;
	}
	if ( AST_NODE_TYPES.MemberExpression === memberExpr.object.type ) {
		const memberObject = memberExpr.object;
		return AST_NODE_TYPES.Identifier === memberObject.object.type && 'window' === memberObject.object.name && 'name' in memberObject.property && 'location' === memberObject.property.name;
	}
	return false;
}


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
			AssignmentExpression( node: TSESTree.AssignmentExpression ) {
				// innerHTML, outerHTML, href, src, action, value, etc. on generic elements

				const left: TSESTree.Expression = node.left;
				const right: TSESTree.Expression = node.right;
				let name: string = '';
				if ( 'property' in left && 'name' in left.property ) {
					name = left?.property?.name ?? '';
				}

				if ( AST_NODE_TYPES.MemberExpression === left.type && SENSITIVE_PROPS.includes( name ) && ! isWindowOrLocationMemberExpression( left ) ) { // avoid duplicate with window checks below
					const propName = name;
					const rhsResolved: TSESTree.Expression = right;


					if ( URL_PROPS.has( propName ) && ( isSafeUrlLiteral( rhsResolved ) || isSafeUrlTemplate( rhsResolved ) ) ) {
						// Safe literal URL assignment (e.g., '#', '/path')
						return;
					} else if ( ! isSanitized( rhsResolved ) ) {
						context.report( {
							node,
							// @ts-expect-error
							message: `Assignment to ${propName} must be sanitized.`,
						} );
					}
				}
				// window.location.<prop> = ...
				if ( isWindowLocationAssignment( node ) ) {
					const propName = name;
					const rhsResolved: TSESTree.Expression = right;
					if ( URL_PROPS.has( propName ) && ( isSafeUrlLiteral( rhsResolved ) || isSafeUrlTemplate( rhsResolved ) ) ) {
						return;
					}
					if ( ! isSanitized( rhsResolved ) ) {
						context.report( {
							node,
							// @ts-expect-error
							message: `Assignment to window.location.${name} must be sanitized with sanitize() or DOMPurify.sanitize()`,
						} );
					}
				}
				// window.<prop> = ...
				if ( isWindowAssignment( node ) ) {
					if ( ! isSanitized( node.right ) ) {
						context.report( {
							node,
							// @ts-expect-error
							message: `Assignment to window.${name} must be sanitized with sanitize() or DOMPurify.sanitize()`,
						} );
					}
				}
			},


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
