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
	var p2 = new Player;
	
	// simulate the coupling 
	p.world = world;
	var world = { gravity : 1000 };	
	p2.world = world;
	
	var keyActionSprint = new KeyAction({
		left : true,
		sprint : true
	});

	var keyActionJump = new KeyAction({
		jump : true
	});
	
	console.log('--- test going left ---');
	console.log( keyActionSprint );
	
	console.log( p.x );
	p.update( keyActionSprint, 1 );
	console.log( p.x );
	
	
	console.log('--- test jump ---');
	
	console.log('--- test binary convert ---');
	console.log( p );
	p2.parseBin( p.toBin() );
	console.log( p2 );


	console.log('--- test dead ---');
	console.log( p.isDead );
	p.die();
	console.log( p.isDead );
	

	
	
});
