import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isSanitized, isStringLike} from '../utils/shared.js';

type Messages =
	'setTimeoutString'
	| 'setIntervalString'
	| 'windowOpenUnsanitized'
	| 'cssTextUnsanitized'
	| 'sanitize'
	| 'domPurify';

type Context = TSESLint.RuleContext<Messages, []>;

/**
 * Check if a node is a literal string
 */
function isLiteralString( node: TSESTree.CallExpressionArgument ): boolean {
	return AST_NODE_TYPES.Literal === node.type && 'string' === typeof node.value;
}

/**
 * Get the callee name from a call expression
 */
function getCalleeName( node: TSESTree.CallExpression ): string {
	if ( AST_NODE_TYPES.Identifier === node.callee.type ) {
		return node.callee.name;
	} else if ( AST_NODE_TYPES.MemberExpression === node.callee.type ) {
		if ( 'name' in node.callee.object && 'name' in node.callee.property ) {
			return `${node.callee.object.name}.${node.callee.property.name}`;
		} else if ( 'name' in node.callee.property ) {
			return node.callee.property.name;
		}
	}
	return '';
}

/**
 * Check if the assignment is to body.style.cssText
 */
function isCssTextAssignment( node: TSESTree.AssignmentExpression ): boolean {
	if ( AST_NODE_TYPES.MemberExpression !== node.left.type ) {
		return false;
	}

	const memberExpr = node.left;
	if ( AST_NODE_TYPES.MemberExpression !== memberExpr.object.type || ! ( 'name' in memberExpr.property ) ) {
		return false;
	}

	const parentMember = memberExpr.object;
	if ( ! ( 'name' in parentMember.object ) || ! ( 'name' in parentMember.property ) ) {
		return false;
	}

	return (
		'body' === parentMember.object.name &&
		'style' === parentMember.property.name &&
		'cssText' === memberExpr.property.name
	);
}

const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		docs: {
			description: 'Detect security issues with HTML sinks: setTimeout/setInterval with strings, unsanitized window.open, and unsanitized body.style.cssText',
		},
		messages: {
			setTimeoutString: 'setTimeout should not receive a string. Pass a function instead.',
			setIntervalString: 'setInterval should not receive a string. Pass a function instead.',
			windowOpenUnsanitized: 'window.open should be sanitized to prevent XSS attacks.',
			cssTextUnsanitized: 'body.style.cssText should be sanitized when not a literal string to prevent XSS attacks.',
			sanitize: 'Wrap with sanitize(...)',
			domPurify: 'Wrap with DOMPurify.sanitize(...)',
		},
		schema: [],
		hasSuggestions: true,
	},

	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: TSESTree.CallExpression ) {
				const calleeName = getCalleeName( node );

				// Handle setTimeout and setInterval with string arguments (not allowed)
				if ( 'setTimeout' === calleeName || 'setInterval' === calleeName ) {
					const firstArg = node.arguments[ 0 ];
					if ( isStringLike( firstArg, context ) ) {
						context.report( {
							node,
							messageId: 'setTimeout' === calleeName ? 'setTimeoutString' : 'setIntervalString',
						} );
					}
					return;
				}

				// Handle window.open with string arguments (must be sanitized)
				if ( 'window.open' === calleeName ) {
					const firstArg = node.arguments[ 0 ];
					if ( ! isSanitized( firstArg ) ) {
						const sourceCode = context.sourceCode;
						const argText = sourceCode.getText( firstArg );

						context.report( {
							node,
							messageId: 'windowOpenUnsanitized',
							suggest: [
								{
									messageId: 'domPurify',
									fix: fixer => fixer.replaceText( firstArg, `DOMPurify.sanitize( ${argText} )` ),
								},
								{
									messageId: 'sanitize',
									fix: fixer => fixer.replaceText( firstArg, `sanitize( ${argText} )` ),
								},
							],
						} );
					}
				}
			},

			AssignmentExpression( node: TSESTree.AssignmentExpression ) {
				// Handle body.style.cssText assignments
				if ( isCssTextAssignment( node ) ) {
					// Allow literal strings but require sanitization for other values
					if ( ! isLiteralString( node.right ) && ! isSanitized( node.right ) ) {
						const sourceCode = context.sourceCode;
						const rightText = sourceCode.getText( node.right );

						context.report( {
							node,
							messageId: 'cssTextUnsanitized',
							suggest: [
								{
									messageId: 'domPurify',
									fix: fixer => fixer.replaceText( node.right, `DOMPurify.sanitize( ${rightText} )` ),
								},
								{
									messageId: 'sanitize',
									fix: fixer => fixer.replaceText( node.right, `sanitize( ${rightText} )` ),
								},
							],
						} );
					}
				}
			},
		};
	},
};

export default plugin;
