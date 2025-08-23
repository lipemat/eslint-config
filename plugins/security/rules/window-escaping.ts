import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isLiteralString} from '../helpers/string.js';
import {isSanitized} from '../helpers/dom-purify.js';


type Messages =
	'unsafeWindow'
	| 'unsafeRead'
	| 'unsafeWindowLocation'
	| 'domPurify'
	| 'sanitize'

type Context = TSESLint.RuleContext<Messages, []>;


// Window and location properties that need special handling
const LOCATION_PROPS = new Set( [ 'href', 'src', 'action',
	'protocol', 'host', 'hostname', 'pathname', 'search', 'hash', 'username', 'port', 'name', 'status',
] );

const WINDOW_PROPS = new Set( [ 'name', 'status' ] );

export function isSafeUrlString( value: string ): boolean {
	return ! /^\s*(?:javascript|data|vbscript|about|livescript)\s*:/i.test( decodeURIComponent( value.replace( /[\u0000-\u001F\u007F]+/g, '' ) ) );
}


function isSafeUrlLiteral( node: TSESTree.Expression ): boolean {
	return isLiteralString( node ) && isSafeUrlString( node.value );
}


function isWindowLocationAssignment( node: TSESTree.AssignmentExpression ): boolean {
	// window.location.<prop> = ...
	return (
		AST_NODE_TYPES.MemberExpression === node.left.type &&
		AST_NODE_TYPES.MemberExpression === node.left.object.type &&
		AST_NODE_TYPES.Identifier === node.left.object.property.type &&
		AST_NODE_TYPES.Identifier === node.left.object.object.type &&
		AST_NODE_TYPES.Identifier === node.left.property.type &&
		'window' === node.left.object.object.name &&
		'location' === node.left.object.property.name &&
		LOCATION_PROPS.has( node.left.property.name )
	);
}


function isWindowAssignment( node: TSESTree.AssignmentExpression ): boolean {
	// window.<prop> = ...
	return (
		AST_NODE_TYPES.MemberExpression === node.left.type &&
		AST_NODE_TYPES.Identifier === node.left.object.type &&
		AST_NODE_TYPES.Identifier === node.left.property.type &&
		'window' === node.left.object.name &&
		WINDOW_PROPS.has( node.left.property.name )
	);
}


function isWindowOrLocation( expression: TSESTree.MemberExpression ): boolean {
	// Helper to detect a window.* or window.location.*
	if ( AST_NODE_TYPES.MemberExpression !== expression.type ) {
		return false;
	}
	if ( AST_NODE_TYPES.Identifier === expression.object.type && 'window' === expression.object.name ) {
		return true;
	}
	if ( AST_NODE_TYPES.MemberExpression === expression.object.type ) {
		const memberObject = expression.object;
		const isObjectWindow = AST_NODE_TYPES.Identifier === memberObject.object.type && 'window' === memberObject.object.name;
		const isPropertyLocation = AST_NODE_TYPES.Identifier === memberObject.property.type && 'location' === memberObject.property.name;

		return isObjectWindow && isPropertyLocation;
	}

	return false;
}


const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		docs: {
			description: 'Require proper escaping for the window and location property access',
		},
		messages: {
			unsafeWindow: 'Assignment to "{{propName}}" must be sanitized.',
			unsafeWindowLocation: 'Assignment to window.location.{{propName}} must be sanitized.',
			unsafeRead: 'Data from JS global {{propName}} may contain user-supplied values and should be sanitized before output to prevent XSS.',

			// Suggestions
			domPurify: 'Wrap the argument with a `DOMPurify.sanitize()` call.',
			sanitize: 'Wrap the argument with a `sanitize()` call.',
		},
		schema: [],
		hasSuggestions: true,
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			AssignmentExpression( node: TSESTree.AssignmentExpression ): void {
				const right: TSESTree.Expression = node.right;
				if ( AST_NODE_TYPES.MemberExpression !== node.left.type || ! ( 'name' in node.left.property ) ) {
					return;
				}
				const propName = node.left.property.name;

				// window.location.<prop> = ...
				if ( isWindowLocationAssignment( node ) ) {
					const rhsResolved: TSESTree.Expression = right;
					if ( ! LOCATION_PROPS.has( propName ) ) {
						return;
					}
					if ( isSafeUrlLiteral( rhsResolved ) || isSanitized( rhsResolved ) ) {
						return;
					}
					context.report( {
						node,
						messageId: 'unsafeWindowLocation',
						data: {
							propName,
						},
						suggest: [
							{
								messageId: 'sanitize',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( right );
									return fixer.replaceText( right, `sanitize( ${argText} )` );
								},
							}, {
								messageId: 'domPurify',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( right );
									return fixer.replaceText( right, `DOMPurify.sanitize( ${argText} )` );
								},
							},
						],
					} );
					return;
				}

				// window.<prop> = ...
				if ( isWindowAssignment( node ) ) {
					if ( isSanitized( node.right ) ) {
						return;
					}
					context.report( {
						node,
						messageId: 'unsafeWindow',
						data: {
							propName,
						},
						suggest: [
							{
								messageId: 'sanitize',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( right );
									return fixer.replaceText( right, `sanitize( ${argText} )` );
								},
							}, {
								messageId: 'domPurify',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const argText = context.sourceCode.getText( right );
									return fixer.replaceText( right, `DOMPurify.sanitize( ${argText} )` );
								},
							},
						],
					} );
				}
			},


			// Check for reading from the window.location properties
			MemberExpression( node: TSESTree.MemberExpression ): void {
				const parent = node.parent;
				if ( AST_NODE_TYPES.AssignmentExpression === parent.type && parent.left === node ) {
					return;
				}

				if ( ! isWindowOrLocation( node ) || ! ( 'name' in node.property ) ) {
					return;
				}
				const propName = node.property.name;
				if ( ! LOCATION_PROPS.has( propName ) ) {
					return;
				}

				if ( AST_NODE_TYPES.CallExpression === parent.type && isSanitized( parent ) ) {
					return;
				}

				context.report( {
					node,
					messageId: 'unsafeRead',
					data: {
						propName,
					},
					suggest: [
						{
							messageId: 'sanitize',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( node );
								return fixer.replaceText( node, `sanitize( ${argText} )` );
							},
						},
						{
							messageId: 'domPurify',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( node );
								return fixer.replaceText( node, `DOMPurify.sanitize( ${argText} )` );
							},
						},
					],
				} );
			},
		};
	},
};

export default plugin;
