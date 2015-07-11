define([], function(){
	function renderBackground(){
		
	}
	
	
	var worldRenderer = function( ctx, world ){
		ctx.save();

		// clearing the screen with black
		ctx.fillStyle = "black";
		ctx.fillRect( 0, 0, window.innerWidth, window.innerHeight );
		
		// camera 
		ctx.translate( world.camera_x, world.camera_y );
		
		
		
		
		ctx.restore();
	}
	
	return { render : worldRenderer }
});
