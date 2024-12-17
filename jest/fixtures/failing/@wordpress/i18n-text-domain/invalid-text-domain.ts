const title = __( 'Hello, world!' );


function getTitle() {
	return __( 'Hello, outer space!', 'wrong' );
}


exports = {
	title,
	getTitle,
};
