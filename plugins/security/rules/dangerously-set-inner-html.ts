import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';

import {isSanitized} from '../helpers/dom-purify.js';

type Messages = 'dangerousInnerHtml' | 'sanitize' | 'domPurify';
type Context = TSESLint.RuleContext<Messages, []>;

function isDangerouslySetInnerHTML( node: TSESTree.JSXAttribute ): boolean {
	return (
		'JSXAttribute' === node.type &&
		'dangerouslySetInnerHTML' === node.name.name
	);
}

function getDangerouslySetInnerHTMLValue( node: TSESTree.JSXAttribute ): null | TSESTree.Property['value'] {
	// Expecting value like: {{ __html: expr }}
	const val = node.value;
	if ( null === val ) {
		return null; // No value provided
	}
	if ( AST_NODE_TYPES.JSXExpressionContainer !== val.type ) {
		return null;
	}
	const expr = val.expression;
	if ( AST_NODE_TYPES.ObjectExpression !== expr.type ) {
		return null;
	}
	const htmlProp = expr.properties.find( p => (
		AST_NODE_TYPES.Property === p.type &&
		(
			( AST_NODE_TYPES.Identifier === p.key.type && '__html' === p.key.name ) ||
			( AST_NODE_TYPES.Literal === p.key.type && '__html' === p.key.value )
		)
	) );
	if ( undefined !== htmlProp && 'value' in htmlProp ) {
		return htmlProp.value;
	}
	return null;
}


const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		hasSuggestions: true,
		docs: {
			description: 'Disallow using unsanitized values in dangerouslySetInnerHTML',
		},
		messages: {
			dangerousInnerHtml: 'Any HTML passed to `dangerouslySetInnerHTML` gets executed. Please make sure it\'s properly escaped.',

			// Suggestions
			domPurify: 'Wrap the content with a `DOMPurify.sanitize()` call.',
			sanitize: 'Wrap the content with a `sanitize()` call.',
		},
		schema: [],
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			JSXAttribute( node: TSESTree.JSXAttribute ) {
				if ( ! isDangerouslySetInnerHTML( node ) ) {
					return;
				}
				const htmlValue = getDangerouslySetInnerHTMLValue( node );
				if ( null === htmlValue || isSanitized( htmlValue ) ) {
					return;
				}

				context.report( {
					node,
					messageId: 'dangerousInnerHtml',
					suggest: [
						{
							messageId: 'domPurify',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								return fixer.replaceText( node, `dangerouslySetInnerHTML={{__html: DOMPurify.sanitize( ${context.sourceCode.getText( htmlValue )} )}}` );
							},
						},
						{
							messageId: 'sanitize',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								return fixer.replaceText( node, `dangerouslySetInnerHTML={{__html: sanitize( ${context.sourceCode.getText( htmlValue )} )}}` );
							},
						},
					],
				} );
			},
		};
	},
};

export default plugin;
