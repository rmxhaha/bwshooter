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
		x : 100
	});
	
	var canvas = document.getElementById('canvas');
	canvas.width = 1000;
	canvas.height = 500;
	
	var context = canvas.getContext('2d');
	
	
	PlayerView.render( context, p );
});

