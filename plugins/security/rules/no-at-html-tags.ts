import {type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import type {AST} from 'svelte-eslint-parser';
import {isSanitized} from '../helpers/dom-purify.js';


type MessageIds = 'dangerousHtml' | 'domPurify' | 'sanitize';

type RuleOptions = Exclude<TSESLint.ReportDescriptor<MessageIds>, 'node'> | {
	node: AST.SvelteMustacheTag,
	readonly messageId: MessageIds;
	readonly suggest?: Readonly<TSESLint.ReportSuggestionArray<MessageIds>> | null;
}

interface SvelteContext extends TSESLint.RuleContext<MessageIds, []> {
	report( options: RuleOptions ): void;
}

interface Module extends TSESLint.RuleModule<MessageIds> {
	create( context: SvelteContext ): TSESLint.RuleListener;
}

const plugin: Module = {
	defaultOptions: [],
	meta: {
		docs: {
			description: 'disallow using `{@html}` to prevent XSS attack. Make sure it\'s properly escaped.',
		},
		schema: [],
		messages: {
			dangerousHtml: '`{@html}` can lead to XSS attack.',

			// Suggestions
			domPurify: 'Wrap the content with a `DOMPurify.sanitize()` call.',
			sanitize: 'Wrap the content with a `sanitize()` call.',
		},
		hasSuggestions: true,
		type: 'problem',
	},
	create( context: SvelteContext ) {
		return {
			'SvelteMustacheTag[kind=raw]'( node: AST.SvelteMustacheTag ) {
				if ( isSanitized( node.expression ) ) {
					return;
				}
				const expression: TSESTree.Node = node.expression as TSESTree.Node;

				context.report( {
					node,
					messageId: 'dangerousHtml',
					suggest: [
						{
							messageId: 'domPurify',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( expression );
								// @ts-expect-error - TS2345: Not a node, but has all required Node properties.
								return fixer.replaceText( node, `{@html DOMPurify.sanitize( ${argText} )}` );
							},
						},
						{
							messageId: 'sanitize',
							fix: ( fixer: TSESLint.RuleFixer ) => {
								const argText = context.sourceCode.getText( expression );
								// @ts-expect-error - TS2345: Not a node, but has all required Node properties.
								return fixer.replaceText( node, `{@html sanitize( ${argText} )}` );
							},
						},
					],
				} );
			},
		};
	},
};

export default plugin;
