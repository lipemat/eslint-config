// This fixture matches all cases from sanitize-sniffs.js for ESLint rule testing

let arbitrary = 'First &middot; Second';

function snx( s: string ): string {
	return '';
}

function ReactComponent() {
	// DangerouslySetInnerHTMLSniff.

	return (
		<div>
			<div dangerouslySetInnerHTML={{__html: arbitrary}} />
		</div>
	);
}

const Test = ( {} ) => {
	// HTMLExecutingFunctionsSniff.
	$( 'body' ).after( arbitrary );
	$( 'body' ).append( arbitrary );
	$( 'body' ).appendTo( arbitrary );
	$( 'body' ).before( arbitrary );
	$( 'body' ).html( arbitrary );
	$( 'body' ).insertAfter( arbitrary );
	$( 'body' ).insertBefore( arbitrary );
	$( 'body' ).prepend( arbitrary );
	$( 'body' ).prependTo( arbitrary );
	$( 'body' ).replaceAll( arbitrary );
	$( 'body' ).replaceWith( arbitrary );

	// InnerHTMLSniff.
	const body = document.getElementById( 'body' );
	if ( body ) {
		body.innerHTML = arbitrary;
	}

	// StringConcatSniff.
	const str = 'test' + '<concat>' + 'test' + snx( '</concat>' );

	// StrippingTagsSniff.
	$( 'body' ).html( arbitrary ).text();

	// WindowSniff.
	window.location.href = arbitrary;
	window.location.protocol = arbitrary;
	window.location.host = arbitrary;
	window.location.hostname = arbitrary;
	window.location.pathname = arbitrary;
	window.location.search = arbitrary;
	window.location.hash = arbitrary;
	window.location.port = arbitrary;
	window.name = arbitrary;
	window.status = arbitrary;

	let w = '';
	w = window.location.href;
	w = window.location.href;
	w = window.location.protocol;
	w = window.location.host;
	w = window.location.hostname;
	w = window.location.pathname;
	w = window.location.search;
	w = window.location.hash;
	w = window.location.port;
	w = window.name;
	w = window.status;

	console.error( w );
};
