import parser from '@typescript-eslint/parser';
import {RuleTester} from '@typescript-eslint/rule-tester';

/**
 * @link https://typescript-eslint.io/packages/rule-tester
 */
const ruleTester = new RuleTester( {
	languageOptions: {
		parser,
		parserOptions: {
			allowDefaultProject: true,
			project: '../../tsconfig.json',
			projectService: {
				allowDefaultProject: [ '*.ts*', '*.tsx' ],
			},
			ecmaFeatures: {
				jsx: true,
			},
		},
	},
} );

export default ruleTester;
