var global = ( global ? global : window );

var Time = function () {
	this.time = new Date();
	this.reset = function () {
		var out = this.getElapsedTime();
		this.time = new Date();

		return out;
	}

	this.getElapsedTime = function () {
		return new Date() - this.time;
	}

	this.reset();
}



var CircularBarUI = Backbone.Model.extend({
	defaults : {
		x : 0,
		y : 0,
		outerWidth : 100,
		innerWidth : 90,
		startAngle : 0,
		endAngle : Math.PI*2,
		opacity : 0.5,
		color : "yellow"
	},
	draw : function(ctx){
		ctx.save();

		var that = this.attributes;

		ctx.fillStyle = that.color;
		ctx.globalAlpha = that.opacity;
		
		ctx.beginPath();
		ctx.arc( that.x, -that.y, that.outerWidth, that.startAngle, that.endAngle, true  );
		ctx.arc( that.x, -that.y, that.innerWidth, that.endAngle, that.startAngle, false );
		ctx.closePath();

		ctx.fill();
		ctx.restore();
	}
});

var RayCast = function( option ){
	// adaptation from : http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms

	// ray starting position
	var rx = option.x;
	var ry = option.y;
	
	// ray direction
	var dx = option.tx - option.x;
	var dy = option.ty - option.y;

	var walls = option.walls;
	var callback = option.callback || function(){};
	
	// ray length
	var r = Math.sqrt( dx * dx + dy * dy );
	
	// direction fraction 1 / normalize( vector )
	var dfx = r/dx;
	var dfy = r/dy;
	
	var range = r;
	var wall = false;

	for( var i = 0; i < walls.length; ++ i ){
		var p = walls[i];
		var t1 = ( p.x - rx ) * dfx;
		var t2 = ( p.x + p.width - rx ) * dfx;

		var t3 = ( p.y - ry ) * dfy;
		var t4 = ( p.y - p.height - ry ) * dfy;
		
		var tmin = Math.max( Math.min(t1,t2), Math.min(t3,t4) );
		var tmax = Math.min( Math.max(t1,t2), Math.max(t3,t4) );
		
		// if tmax < 0, ray (line) is intersecting AABB, but whole AABB is behing us
		if (tmax < 0){
			continue;
		}
		
		// if tmin > tmax, ray doesn't intersect AABB
		if (tmin > tmax){
			continue;
		}
		
		// finding first object to collide with the ray
		if( tmin < range ){
			range = tmin;
			wall = p;
			
			callback({ range : tmin, wall : p });
		}
	}
	
	return { range : range, wall : wall };
}

var Platform = Backbone.Model.extend({
	defaults : {
		x : 0,
		y : 0,
		width : 100,
		height : 30,
		/**
		 *  @param penetrable
		 *  	penetrable from above, when player request to fall 
		 *  	if the current platform is penetrable he can fall
		 */
		penetrable : true
	},
	draw : function( ctx ){
		var that = this.attributes;
		
		ctx.save();
		ctx.fillStyle = "#888888";
		ctx.fillRect( that.x, -that.y, that.width, that.height );
		ctx.restore();
	}
});


var Player = Backbone.Model.extend({
	defaults : {
		x : 0,
		y : 0,
		vx : 0,
		vy : 0
	}
});


var n = new Platform({
	x : 0,
	y : 0,
	width : 3000
});

var context = document.getElementById("canvas").getContext("2d");

var timer = new Time;
function loop() {
	var dt = timer.reset() / 1000;

	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	context.save();
	context.translate( window.innerWidth/2, window.innerHeight/2 );

	n.draw(context);
	
	context.restore();
//	world.update(dt);
//	world.draw(context);
	
	requestAnimationFrame(loop);
}

window.addEventListener("load", function () {
	//console.log( JSON.stringify( world.getAllProperties() ) );
	
	adjustCanvas();
	loop();
});

window.addEventListener("resize", function () {
	adjustCanvas();
});

function adjustCanvas() {
	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}




