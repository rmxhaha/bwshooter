define([
	'Engine/Utility/underscore',
	'Engine/View/PlatformView',
	'Engine/View/LightView',
	'Engine/View/PlayerView'
], function( _, PlatformView, LightView, PlayerView ){
	function renderBackground(){
		
	}
	
	
	var worldRenderer = function( ctx, world ){
		ctx.save();

		// clearing the screen with black
		ctx.fillStyle = "black";
		ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );
		
		// camera 
		ctx.translate( world.camera_x, world.camera_y );
		
		_.each( world.lights, function( light ){
			LightView.render( ctx, light );
		});

		_.each( world.platforms, function( platform ){
			PlatformView.render( ctx, platform );
		});

		_.each( world.players, function( player ){
			PlayerView.render( ctx, player );
		});
		
		
		ctx.restore();
	}
	
	return { render : worldRenderer }
});
