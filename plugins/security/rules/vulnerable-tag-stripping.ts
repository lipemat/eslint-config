import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isJQueryCall} from './jquery-executing.js';

type Messages = 'vulnerableTagStripping' | 'useTextOnly';
type Context = TSESLint.RuleContext<Messages, []>;


/**
 * Detects a vulnerable tag stripping pattern: .html(value).text()
 *
 * This pattern can lead to XSS vulnerabilities when HTML is inserted and then text is extracted.
 *
 * @link https://docs.wpvip.com/security/javascript-security-recommendations/#h-stripping-tags
 */
function isTextAfterHtml( node: TSESTree.CallExpression ): TSESTree.MemberExpression | null {
	// Check if this is a .text() call
	if ( AST_NODE_TYPES.MemberExpression !== node.callee.type || ! ( 'name' in node.callee.property ) ) {
		return null;
	}

	if ( node.callee.property.name !== 'text' ) {
		return null;
	}

	const parentCall = node.callee.object;
	if ( AST_NODE_TYPES.CallExpression !== parentCall.type ) {
		return null;
	}

	if ( AST_NODE_TYPES.MemberExpression !== parentCall.callee.type || ! ( 'name' in parentCall.callee.property ) ) {
		return null;
	}

	if ( parentCall.callee.property.name !== 'html' ) {
		return null;
	}

	return isJQueryCall( parentCall ) ? parentCall.callee : null;
}


const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow jQuery .html().text() chaining which can lead to XSS through tag stripping',
		},
		fixable: 'code',
		hasSuggestions: true,
		messages: {
			vulnerableTagStripping: 'Using .html().text() can lead to XSS vulnerabilities through tag stripping. Use only .text()',
			useTextOnly: 'Remove .html() and move the argument to .text()',
		},
		schema: [],
		type: 'problem',
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: TSESTree.CallExpression ) {
				const htmlProperty = isTextAfterHtml( node );
				if ( null === htmlProperty ) {
					return;
				}
				const jquerySelector = htmlProperty.object;
				const parentCall = htmlProperty.parent;
				if ( AST_NODE_TYPES.CallExpression !== parentCall.type ) {
					return;
				}
				const htmlArg = parentCall.arguments[ 0 ];

				context.report( {
					node,
					messageId: 'vulnerableTagStripping',
					suggest: [
						{
							messageId: 'useTextOnly',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const selectorText = context.sourceCode.getText( jquerySelector );
								const argText = context.sourceCode.getText( htmlArg );
								return fixer.replaceText( node, `${selectorText}.text( ${argText} )` );
							},
						},
					],
				} );
			},
		};
	},
};

export default plugin;
