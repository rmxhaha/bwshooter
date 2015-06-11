require.config({
	baseUrl : '/',
	shim: {
        "Engine/Utility/underscore": {
            exports: "_"
        }
    }
});

require(['Engine/Game/Player','Engine/View/PlayerView'],function( Player, PlayerView ){
	var p = new Player({
		x : 940,
		y : - 100,
		type : 1
	});
	
	var canvas = document.getElementById('canvas');
	var context = canvas.getContext('2d');
	
	adjustCanvas( canvas );
	
	PlayerView.render( context, p );
});

function adjustCanvas( canvas ) {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}
