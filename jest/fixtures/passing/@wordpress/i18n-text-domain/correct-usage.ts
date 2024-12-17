import {__} from '@wordpress/i18n';

const title = __( 'Hello, world!', 'lipe' );


function getTitle() {
	return __( 'Hello, outer space!', 'lipe' );
}


exports = {
	title,
	getTitle,
};
