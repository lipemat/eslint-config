const arbitrary = 'First &middot; Second';


setTimeout( arbitrary );
setInterval( arbitrary );
eval( arbitrary );

document.write( arbitrary );
document.writeln( arbitrary );
window.open( arbitrary );

const body = document.getElementById( 'body' );
if ( body ) {
	body.insertAdjacentHTML( 'beforeend', arbitrary );
	Function( arbitrary );
	body.onclick = arbitrary;
	body.setAttribute( 'onclick', arbitrary );
	body.style.cssText = arbitrary;
	body.setAttribute( 'style', arbitrary );
}
