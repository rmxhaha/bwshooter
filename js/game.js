var context = document.getElementById("canvas").getContext("2d");

function _extend( x, y ){
	for (var key in y) {
		if (y.hasOwnProperty(key)) {
			x[key] = y[key];
		}
	}

	return x;	
}

function Player( setup ){
	_extend( this, setup );
}

Player.prototype = {
	draw : ( function(){
		var pimage = new Image();
		pimage.src = "art/player.png";

		return function( ctx ){
			ctx.save();
			ctx.translate( camera_x, camera_y );
			ctx.drawImage( pimage, this.x - 75, -this.y-70 ,150, 140 );
			this.x;
			this.y;
			
			ctx.restore();
		}
	})()
};

var one = new Player({
	x : 100,
	y : -200
});


var camera_x = 0;
var camera_y = 0;

function loop(){	
	requestAnimationFrame( loop );
}

window.addEventListener("load", function(){
	adjustCanvas();
	one.draw( context );
	
	loop();
});

window.addEventListener("resize", function(){
	adjustCanvas();
});

function adjustCanvas(){
	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}