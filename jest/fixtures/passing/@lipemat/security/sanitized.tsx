import DOMPurify from 'dompurify';

const sanitize = DOMPurify.sanitize;

const arbitrary = 'First &middot; Second';

const passElement: HTMLBodyElement = document.getElementById( 'body' ) as HTMLBodyElement;

const Test = ( {} ) => {
	// DangerouslySetInnerHTMLSniff.
	return (
		<div>
			<div
				dangerouslySetInnerHTML={{__html: sanitize( arbitrary )}}
			/>
		</div>
	);
};

export default Test;

const otherJQ = $( 'div' );
// HTMLExecutingFunctionsSniff.
$( 'body' ).after( sanitize( arbitrary ) );
$( 'body' ).append( $( passElement ) );
$( 'body' ).append( sanitize( arbitrary ) );
$( 'body' ).appendTo( sanitize( arbitrary ) );
$( 'body' ).appendTo( otherJQ );
$( 'body' ).before( sanitize( arbitrary ) );
$( 'body' ).html( sanitize( arbitrary ) );
$( 'body' ).insertAfter( sanitize( arbitrary ) );
$( 'body' ).insertBefore( sanitize( arbitrary ) );
$( 'body' ).prepend( sanitize( arbitrary ) );
$( 'body' ).prependTo( sanitize( arbitrary ) );
$( 'body' ).replaceAll( sanitize( arbitrary ) );
$( 'body' ).replaceWith( sanitize( arbitrary ) );


passElement.after( DOMPurify.sanitize( arbitrary ) );
passElement.after( sanitize( arbitrary ) );
passElement.after( DOMPurify.sanitize( passElement ) );
passElement.append( DOMPurify.sanitize( arbitrary ) );
passElement.append( sanitize( arbitrary ) );
passElement.append( DOMPurify.sanitize( passElement ) );
passElement.before( DOMPurify.sanitize( arbitrary ) );
passElement.before( sanitize( arbitrary ) );
passElement.before( DOMPurify.sanitize( passElement ) );
passElement.prepend( DOMPurify.sanitize( arbitrary ) );
passElement.prepend( sanitize( arbitrary ) );
passElement.prepend( DOMPurify.sanitize( passElement ) );
passElement.replaceWith( DOMPurify.sanitize( arbitrary ) );
passElement.replaceWith( sanitize( arbitrary ) );
passElement.replaceWith( DOMPurify.sanitize( passElement ) );

// InnerHTMLSniff.
// @ts-ignore
document.getElementById( 'body' ).innerHTML = DOMPurify.sanitize( arbitrary );
// @ts-ignore
document.getElementById( 'body' ).innerHTML = sanitize( arbitrary );

// StringConcatSniff.
// @ts-ignore
window.str = 'test' + sanitize( '<concat>' ) + sanitize( 'test' ) + snx( '</concat>' );

// StrippingTagsSniff.
$( 'body' ).html( sanitize( arbitrary ) ).text();

// WindowSniff.
window.location.href = sanitize( arbitrary );
window.location.protocol = sanitize( arbitrary );
window.location.host = sanitize( arbitrary );
window.location.hostname = sanitize( arbitrary );
window.location.pathname = sanitize( arbitrary );
window.location.search = sanitize( arbitrary );
window.location.hash = sanitize( arbitrary );
window.location.port = sanitize( arbitrary );
window.name = sanitize( arbitrary );
// eslint-disable-next-line deprecation/deprecation
window.status = sanitize( arbitrary );

let w = '';
w = sanitize( window.location.href );
w = sanitize( window.location.href );
w = sanitize( window.location.protocol );
w = sanitize( window.location.host );
w = sanitize( window.location.hostname );
w = sanitize( window.location.pathname );
w = sanitize( window.location.search );
w = sanitize( window.location.hash );
w = sanitize( window.location.port );
w = sanitize( window.name );
// eslint-disable-next-line deprecation/deprecation
w = sanitize( window.status );
window.w = w;

setTimeout( DOMPurify.sanitize( arbitrary ) );
setTimeout( sanitize( arbitrary ) );
setTimeout( () => arbitrary );

setInterval( DOMPurify.sanitize( arbitrary ) );
setInterval( sanitize( arbitrary ) );
setInterval( () => arbitrary );

// eslint-disable-next-line deprecation/deprecation
document.write( DOMPurify.sanitize( arbitrary ) );
// eslint-disable-next-line deprecation/deprecation
document.write( sanitize( arbitrary ) );
document.writeln( DOMPurify.sanitize( arbitrary ) );
document.writeln( sanitize( arbitrary ) );
window.open( DOMPurify.sanitize( arbitrary ) );
window.open( sanitize( arbitrary ) );

if ( null !== body ) {
	body.insertAdjacentHTML( 'beforeend', DOMPurify.sanitize( arbitrary ) );
	body.insertAdjacentHTML( 'beforeend', sanitize( arbitrary ) );
	Function( sanitize( arbitrary ) );
	Function( DOMPurify.sanitize( arbitrary ) );
	body.setAttribute( 'onclick', DOMPurify.sanitize( arbitrary ) );
	body.setAttribute( 'onclick', sanitize( arbitrary ) );

	body.style.cssText = DOMPurify.sanitize( arbitrary );
	body.style.cssText = sanitize( arbitrary );
	body.setAttribute( 'style', DOMPurify.sanitize( arbitrary ) );
	body.setAttribute( 'style', sanitize( arbitrary ) );
}
