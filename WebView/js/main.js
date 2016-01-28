require.config({
	baseUrl : '/',
	shim: {
        "Engine/Utility/underscore": {
            exports: "_"
        }
    }
});

require(
[
	'Engine/Utility/class',
	'Engine/Game/Player',
	'Engine/View/PlayerView',
	'Engine/Game/KeyActionListener'
],

function( _class, Player, PlayerView, KAListener )
{
	var p = new Player({
		x : 940,
		y : - 100,
		type : 1
	});
	
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	
	adjustCanvas( canvas );
	
	PlayerView.render( context, p );
	
	var Listener = new KAListener;
	setInterval( function(){
		console.log( Listener.getKeyAction().fall );
	}, 1000 );
});


function adjustCanvas( canvas ) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
