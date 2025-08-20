import {AST_NODE_TYPES, type TSESLint} from '@typescript-eslint/utils';
import type {CallExpression, CallExpressionArgument} from '@typescript-eslint/types/dist/generated/ast-spec';
import {isSanitized} from '../utils/shared.js';

type HtmlExecutingFunctions =
	'document.write' | 'document.writeln';

type Context = TSESLint.RuleContext<HtmlExecutingFunctions, []>;

const DOCUMENT_METHODS: HtmlExecutingFunctions[] = [
	'document.write',
	'document.writeln',
];

function isDocumentMethod( methodName: string ): methodName is HtmlExecutingFunctions {
	return DOCUMENT_METHODS.includes( methodName as HtmlExecutingFunctions );
}

function getDocumentCall( node: CallExpression ): HtmlExecutingFunctions | null {
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
	if ( isDocumentMethod( calleeName ) ) {
		return calleeName;
	}

	return null;
}

const plugin: TSESLint.RuleModule<HtmlExecutingFunctions> = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'Disallow using unsanitized values in functions that execute HTML',
		},
		fixable: 'code',
		messages: {
			'document.write': 'Any HTML used with `document.write` gets executed. Make sure it\'s properly escaped.',
			'document.writeln': 'Any HTML used with `document.writeln` gets executed. Make sure it\'s properly escaped.',
		},
		schema: [],
		type: 'problem',

	},
	create( context: Context ): TSESLint.RuleListener {
		return {
			CallExpression( node: CallExpression ) {
				// Check for document methods
				const documentMethod = getDocumentCall( node );
				if ( documentMethod !== null ) {
					const arg: CallExpressionArgument = node.arguments[ 0 ];
					if ( ! isSanitized( arg ) ) {
						context.report( {
							node,
							messageId: documentMethod,
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( arg );
								return fixer.replaceText( arg, `DOMPurify.sanitize(${argText})` );
							},
						} );
					}
				}
			},
		};
	},
};

export default plugin;
