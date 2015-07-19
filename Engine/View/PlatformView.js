define(['Engine/Game/Platform'], function( Platform ){
	
	function renderPlatform( ctx, platform ){
		ctx.save();
		ctx.fillStyle = "#888888";
		ctx.fillRect( platform.x, -platform.y, platform.width, platform.height );
		ctx.restore();
	}
	
	return { render : renderPlatform }
});
