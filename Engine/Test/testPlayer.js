var requirejs = require('requirejs');

requirejs.config({
	baseUrl : 'E:/Labs/bwshooter/',
	shim: {
		'Engine/Utility/underscore' : {
		  exports: '_'
		}
	}
});

requirejs(['Engine/Utility/class','Engine/Game/Player','Engine/Game/KeyAction'], function( class_, Player, KeyAction ){
	var p = new Player;
	
	// simulate the coupling 
	var world = { gravity : 1000 };	
	p.world = world;
	
	var keyAction = new KeyAction({
		left : true,
		right : false,
		sprint : true,
		jump : false,
		shoot : false
	});
	
	console.log( keyAction );
	
	console.log( p.x );
	p.update( keyAction, 1 );
	console.log( p.x );
});
