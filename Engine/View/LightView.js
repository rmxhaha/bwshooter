define(['Engine/Game/Light','Engine/Utility/underscore'], function( Light, _ ){
	var renderLight = function( ctx, light ){
		if( !(light instanceof Light ) )
			throw new Error('cannot render class beside Light');
		
		oldLightRender.bind( light)( ctx );
	}
	
	function oldLightRender( ctx ){		
		if( !this.turnedOn ) return;
				
		var ddeg = Math.PI * 2 / this.rayCount;
		var x = [this.x];
		var y = [this.y];
				
		var mRange = this.maxRange;
		
		var deg = this.angle - this.angleWidth/2;
		var limit = this.angle + this.angleWidth/2;
		
		for( ; deg < limit; deg += ddeg ){

			var range = this.world.RayCast({ 
				x : this.x, 
				y : this.y, 
				tx : this.x + Math.sin( deg ) * mRange,
				ty : this.y + Math.cos( deg ) * mRange
			});
						
			x.push( this.x + Math.sin( deg ) * range );
			y.push( this.y + Math.cos( deg ) * range );
		}
		
		x.push( this.x );
		y.push( this.y );
		
		ctx.save();
		ctx.fillStyle = this.color;
		ctx.globalAlpha = this.opacity;
		ctx.beginPath();
		
		for( var i = 0; i < x.length; ++ i ){
			ctx.lineTo( x[i], -y[i] );
		}
		
		ctx.fill();
		ctx.restore();
		
	}
	
	return { render : renderLight };
});
