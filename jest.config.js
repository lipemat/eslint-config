/**
 * @notice This file is required in the root of the JS project to allow `jest` to run.
 *
 * @see jest/helpers/jest-runner-eslint.ts
 */
import config from '@lipemat/js-boilerplate/config/jest.config.js';

config.transformIgnorePatterns = [
	'node_modules'
];

// Passed down from `jestRunnerEslint` to allow for a single linting test.
if ( process.env.FIXTURE ) {
	config.roots = [ process.env.FIXTURE ];
	config.runner = 'jest-runner-eslint';
	config.testMatch = [ '**/*.{js,svelte,ts,tsx}' ];
	config.moduleFileExtensions = [ 'js', 'svelte', 'ts', 'tsx' ];
} else {
	config.roots = [ './jest/tests' ];
}

// The fixture tests can run long.
config.testTimeout = 10_000;
config.testEnvironment = 'node';

export default config;
