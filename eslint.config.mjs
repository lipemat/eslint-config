import config from './index.js';

export default [
	...config,
	{
		rules: {
			'@wordpress/i18n-text-domain': [ 'error', {
				allowedTextDomain: [ 'lipe' ],
			} ],
		},
	}
];
