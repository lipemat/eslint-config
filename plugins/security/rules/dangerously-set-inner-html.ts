import {AST_NODE_TYPES, type TSESLint} from '@typescript-eslint/utils';
import type {Expression, JSXAttribute} from '@typescript-eslint/types/dist/generated/ast-spec';
import {isSanitized} from '../utils/shared.js';

type Context = TSESLint.RuleContext<'dangerousInnerHtml', []>;

function isDangerouslySetInnerHTML( node: JSXAttribute ): boolean {
	return (
		'JSXAttribute' === node.type &&
		'dangerouslySetInnerHTML' === node.name.name
	);
}

function getDangerouslySetInnerHTMLValue( node: JSXAttribute ): null | Expression {
	// node is a JSXAttribute for dangerouslySetInnerHTML
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
		return htmlProp.value as Expression;
	}
	return null;
}


const plugin: TSESLint.RuleModule<'dangerousInnerHtml'> = {
	defaultOptions: [],
	meta: {
		type: 'problem',
		fixable: 'code',
		docs: {
			description: 'Disallow using unsanitized values in dangerouslySetInnerHTML',
		},
		messages: {
			dangerousInnerHtml: 'Any HTML passed to `dangerouslySetInnerHTML` gets executed. Please make sure it\'s properly escaped.',
		},
		schema: [],
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			JSXAttribute( node: JSXAttribute ) {
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
					fix: ( fixer: TSESLint.RuleFixer ) => {
						return fixer.replaceText( node, `dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(${context.sourceCode.getText( htmlValue )})}}` );
					},
				} );
			},
		};
	},
};

export default plugin;
