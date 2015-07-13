define(['Engine/Game/Platform'], function( Platform ){
	
	var platformHeight = 30;
	
	function renderPlatform( ctx, platform ){
		ctx.save();
		ctx.fillStyle = "#888888";
		ctx.fillRect( platform.x, -platform.y, platform.width, platformHeight );
		ctx.restore();
	}
	
	return { render : renderPlatform }
});
