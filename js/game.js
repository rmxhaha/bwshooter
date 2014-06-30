var gravity = 400; // only applied to y axis

var context = document.getElementById("canvas").getContext("2d");

function _extend(x, y) {
	for (var key in y) {
		if (y.hasOwnProperty(key)) {
			x[key] = y[key];
		}
	}

	return x;
}

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

function World(setup){
	/**
	 *  @param timestep
	 *  	fix delta time per update
	 *  @param iteration 
	 *  	how many iteration per update ( more better, too much doesn't make a difference )
	 */
	 
	var _default = {
		timestep : 0.05,
		iteration : 6 
	};
	
	this.players = [];
	this.platforms = [];
	this.lights = [];
	
	_extend( this, _default );
	_extend( this, setup );
};

World.prototype = {
	timebuffer : 0,
	add : function(item){
		if( item instanceof Platform ){
			this.platforms.push( item );
		}
		else if( item instanceof Player ){
			this.players.push( item );
		}
		else if( item instanceof Light ){
			this.lights.push( item );
		}
		else {
			throw new Error('Unknown Type Added' );
		}
	},
	updateCoordinate : function(dt){
		for( var i = 0; i < this.players.length; ++ i ){
			this.players[i].update(dt);
		}
	},
	fixCoordinate : function(){
		function isInBetween( bottom, data , top ){
			return bottem < data && data < top;
		}
		
		function isInPlatformArea( platform, minX, maxX ){
			return( 
				(platform.x < minX && minX <= platform.x + platform.width) || 
				(platform.x <= maxX && maxX < platform.x + platform.width) );
		}
		
		for( var i = 0; i < this.players.length; ++ i ){
			var p = this.players[i];
			
			// don't check if hero is moving up
			if( p.vy > 0 ) continue;

			// pre-calculation
			var leftX = p.x;
			var rightX = p.x + p.width;
			
			var bottomY = p.y - p.height;
			
			// if previous data is still valid
			if( p.topPlatform && isInPlatformArea( p.topPlatform, leftX, rightX ) ){
				console.log("R");
				// coordinate need to be fixed

				if( bottomY < p.topPlatform.y ){
					// fix coordinate 
					p.y = p.topPlatform.y + p.height;

					// previous data is still valid
					return;
				}
			}

			// prepare data correction for next iteration			
			var topPlatform = false;
			
			for( var k = 0; k < this.platforms.length; ++ k ){
				var q = this.platforms[k];

				if( q.y > bottomY ) continue;
				
				if( isInPlatformArea(q, leftX, rightX ) ){
					if( !topPlatform || topPlatform.y < q.y ) 
						topPlatform = q;
				}
			}
			
			if( topPlatform == false ){
				throw new Error('bottemless pit is found');
			}
			
			p.topPlatform = topPlatform;
			
		}
	},
	update : function( real_dt ){
		this.timebuffer += real_dt;
		var dt = this.timestep;
		
		// platforms and lights doesn't need update yet
		while( this.timebuffer > dt ){
			this.updateCoordinate(dt);
			this.fixCoordinate();
			this.timebuffer -= dt;
		}
	},
	draw : function(ctx){
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

		for( var i = 0; i < this.players.length; ++ i ){
			this.players[i].draw(ctx);
		}
		for( var i = 0; i < this.lights.length; ++ i ){
			this.lights[i].draw(ctx);
		}
		for( var i = 0; i < this.platforms.length; ++ i ){
			this.platforms[i].draw(ctx);
		}
	}
};

function Platform(setup){
	var _default = {
		x : 0,
		y : 0,
		width : 100
	};

	_extend(this, _default);
	_extend(this, setup);
}

Platform.prototype = {
	draw : function(ctx){
		ctx.save();
		ctx.translate(camera_x, camera_y);
		ctx.fillStyle = "#888888";
		ctx.fillRect( this.x, -this.y, this.width, this.height );
		ctx.restore();
	},
	height : 30
};

function Player(setup) {
	var _default = {
		x : 0,
		y : 0,
		vy : 0,
		vx : 0,
		walkSpeed : 150
	};

	_extend(this, _default);
	_extend(this, setup);
}

Player.prototype = {
	draw : (function () {
		var pimage = new Image();
		pimage.src = "art/player.png";

		return function (ctx) {
			ctx.save();
			ctx.translate(camera_x, camera_y);
			ctx.drawImage(
				pimage, 
				0,
				( this.sideRight ? 0 : 1 ) * this.height,
				this.width, this.height,				

				this.x, 
				-this.y, 
				this.width, this.height);
			ctx.restore();
		}
	})(),
	sideRight : true, 
	width : 150,
	height : 140,
	update : function( dt ){
		this.vy -= gravity * dt;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	},
	jump : function(){
		if( this.topPlatform && this.y - this.height == this.topPlatform.y ){
			this.vy = 400;
		}
	}
};

var camera_x = 0;
var camera_y = 0;

var world = new World;

var one = new Player({
		x : 100,
		y : -200,
		vy : 0,
		vx : 0,
		walkSpeed : 150
	});

var p = new Platform({ x : 100, y : -600, width : 300 });

world.add(one);
world.add(p);




var timer = new Time;
function loop() {
	var dt = timer.reset() / 1000;

	world.update(dt);
	world.draw(context);

	requestAnimationFrame(loop);
}

window.addEventListener("keydown", function(event){
	switch( event.keyCode ){
	case 37: // left
		one.vx = -one.walkSpeed;
		one.sideRight = false;
		break;
	case 38: // up
	case 32: // spacebar
		one.jump();
		break;
	case 39: // right
		one.vx = one.walkSpeed;
		one.sideRight = true;
		break;
	case 40: // down
		break;
	}
});

window.addEventListener("keyup", function(event){
	switch( event.keyCode ){
	case 37: // left
	case 39: // right
		one.vx = 0;
		break;
	}
});

window.addEventListener("load", function () {
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
