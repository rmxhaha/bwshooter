var requirejs = require('requirejs');
requirejs(['History'], function( History ){
	var testH = new History( 5, 3 );
	testH.updateSnapshot( 4 ); // 1 
	testH.updateSnapshot( 5 ); // 2
	testH.updateSnapshot( 6 ); // 3
	testH.updateSnapshot( 7 ); // 4
	testH.updateSnapshot( 8 ); // 5 
	testH.updateSnapshot( 9 ); // 6
	testH.updateSnapshot( 10 ); // 7
	
	console.log( testH.getSnapshot(7) );
	
});