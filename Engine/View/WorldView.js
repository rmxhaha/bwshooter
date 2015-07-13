define([
	'Engine/Utility/underscore'
	'Engine/View/PlatformView'
], function( _, PlatformView ){
	function renderBackground(){
		
	}
	
	
	var worldRenderer = function( ctx, world ){
		ctx.save();

		// clearing the screen with black
		ctx.fillStyle = "black";
		ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );
		
		// camera 
		ctx.translate( world.camera_x, world.camera_y );
		
		_.each( world.platforms, function( platform ){
			PlatformView.render( ctx, platform );
		});
		
		ctx.restore();
	}
	
	return { render : worldRenderer }
});
