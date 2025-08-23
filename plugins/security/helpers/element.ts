import type {TSESLint, TSESTree} from '@typescript-eslint/utils';
import type {Type} from 'typescript';
import {getType} from './ts-types.js';

/**
 * Is the type of variable being passed a DOM element?
 *
 * - DOM elements are of the type `HTML{*}Element`.
 * - DOM elements do not require sanitization.
 *
 * @link https://typescript-eslint.io/developers/custom-rules/#typed-rules
 */
export function isDomElementType<Context extends Readonly<TSESLint.RuleContext<string, readonly []>>>( expression: TSESTree.CallExpressionArgument, context: Context ): boolean {
	const type: Type = getType<Context>( expression, context );

	const name = type.getSymbol()?.escapedName ?? '';
	// Match any type that ends with "Element", e.g., HTMLElement, HTMLDivElement, Element, etc.
	if ( 'Element' === name ) {
		return true;
	}
	return name.startsWith( 'HTML' ) && name.endsWith( 'Element' );
}
