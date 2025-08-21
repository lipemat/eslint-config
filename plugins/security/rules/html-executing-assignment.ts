import {AST_NODE_TYPES, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import {isSanitized} from '../utils/shared.js';

type UnsafeProperties = 'innerHTML' | 'outerHTML';

type Messages = 'executed' | 'sanitize' | 'domPurify';
type Context = TSESLint.RuleContext<Messages, []>;

const UNSAFE_PROPERTIES: UnsafeProperties[] = [
	'innerHTML', 'outerHTML',
];

function isUnsafeProperty( propertyName: string ): propertyName is UnsafeProperties {
	return UNSAFE_PROPERTIES.includes( propertyName as UnsafeProperties );
}

const plugin: TSESLint.RuleModule<Messages> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in HTML executing property assignments',
		},
		fixable: 'code',
		hasSuggestions: true,
		messages: {
			executed: 'Any HTML used with `{{propertyName}}` gets executed. Make sure it\'s properly escaped.',

			// Suggestions
			domPurify: 'Wrap the argument with a `DOMPurify.sanitize()` call.',
			sanitize: 'Wrap the argument with a `sanitize()` call.',
		},
		schema: [],
		type: 'problem',
	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			AssignmentExpression( node: TSESTree.AssignmentExpression ) {
				// Handle element.innerHTML = value and element.outerHTML = value
				if ( AST_NODE_TYPES.MemberExpression !== node.left.type || ! ( 'name' in node.left.property ) ) {
					return;
				}
				const propertyName = node.left.property.name;
				if ( ! isUnsafeProperty( propertyName ) ) {
					return;
				}
				const value = node.right;
				if ( ! isSanitized( value ) ) {
					context.report( {
						node,
						messageId: 'executed',
						data: {
							propertyName,
						},
						suggest: [
							{
								messageId: 'domPurify',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const valueText = context.sourceCode.getText( value );
									return fixer.replaceText( value, `DOMPurify.sanitize( ${valueText} )` );
								},
							},
							{
								messageId: 'sanitize',
								fix: ( fixer: TSESLint.RuleFixer ) => {
									const valueText = context.sourceCode.getText( value );
									return fixer.replaceText( value, `sanitize( ${valueText} )` );
								},
							},
						],
					} );
				}
			},
		};
	},
};

export default plugin;
