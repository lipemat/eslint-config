import type {FlatConfig} from '@typescript-eslint/utils/ts-eslint';
// @ts-expect-error TS7016: Could not find a declaration file
import wordpress from '@wordpress/eslint-plugin';


export function getWordPressConfig(): FlatConfig.Config[] {
	return adjustWordPressConfig( wordpress.configs.recommended );
}

/**
 * `@wordpress/eslint-plugin` uses a TypeScript import resolver.
 *
 * `eslint-import-resolver-typescript` is only a transitive dependency for consumers,
 * so Yarn PnP cannot resolve it from the linted package.
 *
 * Use the Node resolver instead, which `eslint-plugin-import` already provides.
 */
export function adjustWordPressConfig( config: FlatConfig.Config[] ): FlatConfig.Config[] {
	return config.map( ( entry: FlatConfig.Config ) => {
		const resolver = entry.settings?.[ 'import/resolver' ] as Record<string, object> | undefined;
		if ( typeof resolver !== 'object' || null === resolver || ! ( 'typescript' in resolver ) ) {
			return entry;
		}
		const {typescript, ...otherResolvers} = resolver;
		return {
			...entry,
			settings: {
				...entry.settings,
				'import/resolver': {
					...otherResolvers,
					node: typescript,
				},
			},
		};
	} );
}
