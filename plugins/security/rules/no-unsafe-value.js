// Sinks: property assignments and function calls
const SENSITIVE_PROPS = [
	'innerHTML', 'outerHTML', 'href', 'src', 'action',
	'protocol', 'host', 'hostname', 'pathname', 'search', 'hash', 'username', 'port', 'name', 'status',
];
const URL_PROPS = new Set( [ 'href', 'src', 'action', 'protocol', 'host', 'hostname', 'pathname', 'search', 'hash', 'username', 'port' ] );
const SENSITIVE_FUNCS = [
	// Only global sinks here; timers handled separately and jQuery methods handled elsewhere
	'document.write', 'eval',
];

// React dangerouslySetInnerHTML
function isDangerouslySetInnerHTML( node ) {
	return (
		'JSXAttribute' === node.type &&
		node.name && 'dangerouslySetInnerHTML' === node.name.name
	);
}

function getDangerouslySetInnerHTMLValue( node ) {
	// node is a JSXAttribute for dangerouslySetInnerHTML
	// Expecting value like: {{ __html: expr }}
	const val = node.value;
	if ( ! val || 'JSXExpressionContainer' !== val.type ) {
		return null;
	}
	const expr = val.expression;
	if ( ! expr || 'ObjectExpression' !== expr.type ) {
		return null;
	}
	const htmlProp = expr.properties.find( p => (
		p && 'Property' === p.type &&
		(
			( 'Identifier' === p.key.type && '__html' === p.key.name ) ||
			( 'Literal' === p.key.type && '__html' === p.key.value )
		)
	) );
	if ( ! htmlProp ) {
		return null;
	}
	return htmlProp.value; // Could be Identifier, CallExpression, Literal, etc.
}

function isSanitized( node ) {
	return (
		node && 'CallExpression' === node.type &&
		(
			( 'Identifier' === node.callee.type && 'sanitize' === node.callee.name ) ||
			( 'MemberExpression' === node.callee.type &&
				node.callee.object &&
				(
					( 'Identifier' === node.callee.object.type && 'dompurify' === String( node.callee.object.name ).toLowerCase() )
				) &&
				node.callee.property && 'sanitize' === node.callee.property.name )
		)
	);
}

function isStringConcat( node ) {
	// 'foo' + userInput + 'bar' (HTML-like only)
	return node && 'BinaryExpression' === node.type && '+' === node.operator &&
		hasHtmlLikeLiteralStrings( node );
}

function hasHtmlLikeLiteralStrings( node ) {
	if ( ! node ) {
		return false;
	}
	if ( 'Literal' === node.type && 'string' === typeof node.value ) {
		// Only treat as risky if it looks like HTML, e.g., contains angle brackets
		return /[<>]/.test( node.value );
	}
	if ( 'TemplateLiteral' === node.type ) {
		// Check any static part of template for HTML-like content
		return node.quasis && node.quasis.some( q => q && q.value && 'string' === typeof q.value.cooked && /[<>]/.test( q.value.cooked ) );
	}
	if ( 'BinaryExpression' === node.type && '+' === node.operator ) {
		return hasHtmlLikeLiteralStrings( node.left ) || hasHtmlLikeLiteralStrings( node.right );
	}
	return false;
}

function isJQueryCall( node ) {
	// Detect $(...).method(userInput) or jQuery(...).method(...)
	if ( ! node.callee || 'MemberExpression' !== node.callee.type ) {
		return false;
	}
	const methodName = node.callee.property && node.callee.property.name;
	if ( ! [ 'after', 'append', 'appendTo', 'before', 'html', 'insertAfter', 'insertBefore', 'prepend', 'prependTo', 'replaceAll', 'replaceWith' ].includes( methodName ) ) {
		return false;
	}
	// Walk to the root object of the call chain
	let obj = node.callee.object;
	while ( obj && 'MemberExpression' === obj.type ) {
		obj = obj.object;
	}
	return (
		obj && 'CallExpression' === obj.type && obj.callee && 'Identifier' === obj.callee.type &&
		( '$' === obj.callee.name || 'jQuery' === obj.callee.name )
	);
}

function isSafeUrlLiteral( node ) {
	return (
		node && 'Literal' === node.type && 'string' === typeof node.value &&
		! /^(javascript:)/i.test( node.value )
	);
}

function isAllExpressionsEncoded( templateNode ) {
	if ( ! templateNode || 'TemplateLiteral' !== templateNode.type ) {
		return false;
	}
	return Array.isArray( templateNode.expressions ) && templateNode.expressions.length > 0 && templateNode.expressions.every( expr => (
		'CallExpression' === expr.type &&
		'Identifier' === expr.callee.type &&
		( 'encodeURIComponent' === expr.callee.name || 'encodeURI' === expr.callee.name )
	) );
}

function isSafeUrlTemplate( node ) {
	if ( ! node || 'TemplateLiteral' !== node.type ) {
		return false;
	}
	// Basic scheme safety on the first static chunk
	const firstChunk = node.quasis && node.quasis[ 0 ] && node.quasis[ 0 ].value && ( node.quasis[ 0 ].value.cooked || '' );
	if ( /^javascript:/i.test( firstChunk ) ) {
		return false;
	}
	return isAllExpressionsEncoded( node );
}

function getIdentifierInit( idNode, context ) {
	if ( ! idNode || 'Identifier' !== idNode.type ) {
		return null;
	}
	let scope = context.sourceCode.getScope( idNode );
	while ( scope ) {
		if ( scope.set && scope.set.has( idNode.name ) ) {
			const variable = scope.set.get( idNode.name );
			if ( variable && Array.isArray( variable.defs ) && variable.defs.length ) {
				const def = variable.defs[ 0 ];
				if ( def && def.node && def.node.init ) {
					return def.node.init;
				}
			}
		}
		scope = scope.upper;
	}
	return null;
}

function isWindowLocationAssignment( node ) {
	// window.location.<prop> = ...
	return (
		node.left && 'MemberExpression' === node.left.type &&
		node.left.object && 'MemberExpression' === node.left.object.type &&
		node.left.object.object && 'window' === node.left.object.object.name &&
		node.left.object.property && 'location' === node.left.object.property.name &&
		node.left.property && SENSITIVE_PROPS.includes( node.left.property.name )
	);
}

function isWindowAssignment( node ) {
	// window.<prop> = ...
	return (
		node.left && 'MemberExpression' === node.left.type &&
		node.left.object && 'window' === node.left.object.name &&
		node.left.property && SENSITIVE_PROPS.includes( node.left.property.name )
	);
}

function isWindowOrLocationMemberExpression( memberExpr ) {
	// Helper to detect window.* or window.location.*
	if ( ! memberExpr || 'MemberExpression' !== memberExpr.type ) {
		return false;
	}
	if ( memberExpr.object && 'Identifier' === memberExpr.object.type && 'window' === memberExpr.object.name ) {
		return true;
	}
	if ( memberExpr.object && 'MemberExpression' === memberExpr.object.type ) {
		const obj = memberExpr.object;
		return obj.object && 'Identifier' === obj.object.type && 'window' === obj.object.name && obj.property && 'location' === obj.property.name;
	}
	return false;
}


export default {
	rules: {
		'no-unsafe-value': {
			meta: {
				type: 'problem',
				docs: {
					description: 'Disallow using unsanitized values in sensitive sinks (DOM, navigation, etc)',
				},
				schema: [],
			},
			create( context ) {
				return {
					JSXAttribute( node ) {
						if ( isDangerouslySetInnerHTML( node ) ) {
							const htmlValue = getDangerouslySetInnerHTMLValue( node );
							if ( htmlValue && ! isSanitized( htmlValue ) ) {
								context.report( {
									node,
									message: 'dangerouslySetInnerHTML value must be sanitized with sanitize() or DOMPurify.sanitize()',
								} );
							}
						}
					},
					AssignmentExpression( node ) {
						// innerHTML, outerHTML, href, src, action, value, etc. on generic elements
						if (
							node.left && 'MemberExpression' === node.left.type &&
							SENSITIVE_PROPS.includes( node.left.property && node.left.property.name ) &&
							! isWindowOrLocationMemberExpression( node.left ) // avoid duplicate with window checks below
						) {
							const propName = node.left.property && node.left.property.name;
							const rhsResolved = ( node.right && 'Identifier' === node.right.type ) ? ( getIdentifierInit( node.right, context ) || node.right ) : node.right;
							if ( 'value' === propName ) {
								// Be conservative for `.value`: only flag when HTML-like strings are present
								if ( hasHtmlLikeLiteralStrings( rhsResolved ) && ! isSanitized( rhsResolved ) ) {
									context.report( {
										node,
										message: 'Assignment to value contains HTML-like content. Sanitize with sanitize() or DOMPurify.sanitize()',
									} );
								}
							} else if ( URL_PROPS.has( propName ) && ( isSafeUrlLiteral( rhsResolved ) || isSafeUrlTemplate( rhsResolved ) ) ) {
								// Safe literal URL assignment (e.g., '#', '/path')
								return;
							} else if ( ! isSanitized( rhsResolved ) ) {
								context.report( {
									node,
									message: `Assignment to ${propName} must be sanitized with sanitize() or DOMPurify.sanitize()`,
								} );
							}
						}
						// window.location.<prop> = ...
						if ( isWindowLocationAssignment( node ) ) {
							const propName = node.left.property && node.left.property.name;
							const rhsResolved = ( node.right && 'Identifier' === node.right.type ) ? ( getIdentifierInit( node.right ) || node.right ) : node.right;
							if ( URL_PROPS.has( propName ) && ( isSafeUrlLiteral( rhsResolved ) || isSafeUrlTemplate( rhsResolved ) ) ) {
								return;
							}
							if ( ! isSanitized( rhsResolved ) ) {
								context.report( {
									node,
									message: `Assignment to window.location.${node.left.property.name} must be sanitized with sanitize() or DOMPurify.sanitize()`,
								} );
							}
						}
						// window.<prop> = ...
						if ( isWindowAssignment( node ) ) {
							if ( ! isSanitized( node.right ) ) {
								context.report( {
									node,
									message: `Assignment to window.${node.left.property.name} must be sanitized with sanitize() or DOMPurify.sanitize()`,
								} );
							}
						}
						// String concat with HTML in assignments
						if ( isStringConcat( node.right ) ) {
							context.report( {
								node,
								message: 'String concatenation with potential HTML detected. Use sanitize() or DOMPurify.sanitize()',
							} );
						}
					},
					VariableDeclarator( node ) {
						// Detect string concatenation assigned at declaration time
						const init = node.init;
						if ( ! init ) {
							return;
						}
						if ( isSanitized( init ) ) {
							return; // e.g., const x = sanitize('a' + b)
						}
						if ( isStringConcat( init ) ) {
							context.report( {
								node,
								message: 'String concatenation with potential HTML detected. Use sanitize() or DOMPurify.sanitize()',
							} );
						}
					},
					CallExpression( node ) {
						// document.write, eval, setTimeout, setInterval
						let calleeName = '';
						if ( 'Identifier' === node.callee.type ) {
							calleeName = node.callee.name;
						} else if ( 'MemberExpression' === node.callee.type ) {
							if ( node.callee.object && node.callee.object.name && node.callee.property && node.callee.property.name ) {
								calleeName = node.callee.object.name + '.' + node.callee.property.name;
							}
						}

						// Special-case timers: only unsafe when a string is passed (evaluated as code).
						if ( 'setTimeout' === calleeName || 'setInterval' === calleeName ) {
							const arg = node.arguments[ 0 ];
							if ( arg ) {
								const isFunctionArg = (
									'FunctionExpression' === arg.type || 'ArrowFunctionExpression' === arg.type || 'Identifier' === arg.type
								);
								if ( ! isFunctionArg ) {
									const isStringy = (
										( 'Literal' === arg.type && 'string' === typeof arg.value ) ||
										'TemplateLiteral' === arg.type ||
										isStringConcat( arg )
									);
									if ( isStringy ) {
										context.report( {
											node,
											message: `${calleeName} should not receive a string. Pass a function instead.`,
										} );
									}
								}
							}
							return; // Do not apply generic sanitizer checks to timer callbacks.
						}
						if ( SENSITIVE_FUNCS.includes( calleeName ) ) {
							const arg = node.arguments[ 0 ];
							if ( arg && ! isSanitized( arg ) ) {
								context.report( {
									node,
									message: `${calleeName} argument must be sanitized with sanitize() or DOMPurify.sanitize()`,
								} );
							}
						}
						// jQuery chained calls: $(body).html(arbitrary).text();
						if ( isJQueryCall( node ) ) {
							const arg = node.arguments[ 0 ];
							if ( arg && ! isSanitized( arg ) ) {
								context.report( {
									node,
									message: `jQuery method ${node.callee.property.name} argument must be sanitized with sanitize() or DOMPurify.sanitize()`,
								} );
							}
						}
					},
				};
			},
		},
	},
};
