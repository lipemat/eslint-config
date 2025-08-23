import {ESLintUtils, type TSESLint, type TSESTree} from '@typescript-eslint/utils';
import type {Type} from 'typescript';

/**
 * Get the TypeScript type of node.
 */
export function getType<Context extends Readonly<TSESLint.RuleContext<string, readonly []>>>( expression: TSESTree.CallExpressionArgument, context: Context ): Type {
	const {getTypeAtLocation} = ESLintUtils.getParserServices( context );
	const type = getTypeAtLocation( expression );
	return type.getNonNullableType();
}
