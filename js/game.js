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
		
		// adding pointer to the world where they belong
		item.world = this;
		
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
				(platform.x < minX && minX < platform.x + platform.width) || 
				(platform.x < maxX && maxX < platform.x + platform.width) );
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
				
				// coordinate need to be fixed
				if( bottomY < p.topPlatform.y ){
					// fix coordinate 
					p.y = p.topPlatform.y + p.height;
					p.vy = 0;

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
		
		// update that doesn't concern physical coordination
		for( var i = 0; i < this.lights.length; ++ i ){
			var mod = this.lights[i].mod;
			for( var k = 0; k < mod.length; ++ k ){
				mod[k]( real_dt );
			}
		}
	},
	draw : function(ctx){
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

		for( var i = 0; i < this.lights.length; ++ i ){
			this.lights[i].draw(ctx);
		}
		for( var i = 0; i < this.platforms.length; ++ i ){
			this.platforms[i].draw(ctx);
		}
		for( var i = 0; i < this.players.length; ++ i ){
			this.players[i].draw(ctx);
		}
	},
	RayCast : function(option){
		// adaptation from : http://gamedev.stackexchange.com/questions/18436/most-efficient-aabb-vs-ray-collision-algorithms
		var rx = option.x;
		var ry = option.y;
		var dx = option.tx - option.x;
		var dy = option.ty - option.y;
		
		var r = Math.sqrt( dx * dx + dy * dy );
		
		// diraction fraction 1 / normalize( vector )
		var dfx = r/dx;
		var dfy = r/dy;
		
		var range = r;
		
		for( var i = 0; i < this.platforms.length; ++ i ){
			var p = this.platforms[i];
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
			
			range = Math.min( tmin, range );
		}
		
		return range;
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

		// sprite specific coordinate
		var dx = 30;
		var dw = 150;
		var dh = 140;

		return function (ctx) {
			ctx.save();
			ctx.translate(camera_x, camera_y);
			ctx.drawImage(
				pimage, 
				0,
				( this.sideRight ? 0 : 1 ) * dh,
				dw, dh,				

				this.x - dx, 
				-this.y - 1, 
				dw, dh);
			ctx.restore();
		}
	})(),
	sideRight : true, 
	width : 90,
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
	},
	fall : function(){
		this.topPlatform = false;
	}
};

function Light(setup){
	this.mod = [];
	_extend( this, setup );
}

Light.prototype = {
	x : 0,
	y : 0,
	maxRange : 400,
	rayCount : 100,
	color : "red",
	opacity : 1,
	start_rotation : 0,
	delta_rotation : Math.PI*2,
	draw : function( ctx ){
		var ddeg = Math.PI * 2 / this.rayCount;
		var x = [this.x];
		var y = [this.y];
		
		var mRange = this.maxRange;
		var limit = this.start_rotation + this.delta_rotation;
		for( var deg = this.start_rotation; deg < limit; deg += ddeg ){
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
		ctx.translate( camera_x, camera_y );
		ctx.fillStyle = this.color;
		ctx.globalAlpha = this.opacity;
		ctx.beginPath();
		
		for( var i = 0; i < x.length; ++ i ){
			ctx.lineTo( x[i], -y[i] );
		}
		
		ctx.fill();
		ctx.restore();
	},
	addMod : function( mod ){
		this.mod.push( mod.bind( this ) );
	}
};

function LightFlickeringMod(option){
	var setup = {
		offDuration : 1,
		flickerDuration : 0.6,
		flickerSpeed : 0.2
	};
	
	_extend( setup, option );
	
	var time = 0;
	return function( dt ){
		time += dt;

		if( time >= setup.flickerDuration + setup.offDuration ){
			time -= setup.flickerDuration + setup.offDuration;
		}
		
		if( time < setup.flickerDuration ){
			this.color = ( Math.floor( time / setup.flickerSpeed ) % 2 == 0 ? "white" : "black" );			
		}
		else { // time < flickerDuration + offDuration
			this.color = "black";
		}
	}
}

function LightSwingingMod(option){
	var setup = {
		speed : 0.5, // in swing
		angleDeviation : Math.PI/10,
		flickerSpeed : 0.2,
		angleBase : Math.PI * 3/4
	};
	
	_extend( setup, option );
	
	var deg = 0;
	return function( dt ){
		this.start_rotation = setup.angleBase + Math.sin( deg ) * setup.angleDeviation;
		deg += Math.PI * 2 * setup.speed * dt;
	}
}

function SunFxMod(option){
	if( typeof option !== "object" ) option = {};
	// in seconds
	var setup = {
		dayTime : 3, 
		nightTime : 3,
		switchTime : 3
	};
	
	var dayTime = option.dayTime || setup.dayTime;
	var nightTime = option.nightTime || setup.nightTime;
	var switchTime = option.switchTime || setup.switchTime;
	
	var time = 0;
	
	return function( dt ){
		time += dt;
		
		if( time > dayTime + switchTime + nightTime + switchTime ){
			time -= dayTime + switchTime + nightTime + switchTime;
		}
		
		if( time < dayTime ){
			this.opacity = 1;
		}
		else if( time < dayTime + switchTime ){
			this.opacity = Math.cos( (time-dayTime) / switchTime * Math.PI/2 );
		}
		else if( time < dayTime + switchTime + nightTime ){
			this.opacity = 0;
		}
		else {
			this.opacity = Math.sin( (time-dayTime-switchTime-nightTime) / switchTime * Math.PI/2 );			
		}
		
	}
	
}

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

function focusCamera(){
	camera_x = -one.x + window.innerWidth/2 - one.width/2;
	camera_y = one.y + window.innerHeight/2 - one.height/2;
}

var p = new Platform({ x : 100, y : -600, width : 300 });

world.add(one);
world.add(p);

for( var i = 0; i < 3; ++ i ){
	world.add( new Platform({ 
			x : 460 + 150*i, 
			y : -610 - i*10, 
			width : 100 
		})
	);
}

world.add( new Platform({ x : -1000, y : -1000, width : 3000 }) );

var light = new Light({x : 209, y : 400, color : "white", opacity : 0.9, rayCount : 4000, maxRange : 5000 });
var light2 = new Light({x : 250, y : -640, color : "white", opacity : 0.9, rayCount : 400, start_rotation : Math.PI, delta_rotation : Math.PI /2, maxRange : 1000 });

light2.addMod( LightSwingingMod() );
light2.addMod( LightFlickeringMod() );
light.addMod( SunFxMod() );

world.add(light);
world.add(light2);


var timer = new Time;
function loop() {
	var dt = timer.reset() / 1000;

	
	world.update(dt);
	focusCamera();
	world.draw(context);

	requestAnimationFrame(loop);
}

var keyDownPressed = false;

window.addEventListener("keydown", function(event){
	switch( event.keyCode ){
	case 37: // left
		one.vx = -one.walkSpeed;
		one.sideRight = false;
		break;
	case 38: // up
	case 32: // spacebar
		if( !keyDownPressed ){
			one.jump();
		}
		else {
			one.fall();
		}
		break;
	case 39: // right
		one.vx = one.walkSpeed;
		one.sideRight = true;
		break;
	case 40: // down
		keyDownPressed = true;
		break;
	}
});

window.addEventListener("keyup", function(event){
	switch( event.keyCode ){
	case 37: // left
	case 39: // right
		one.vx = 0;
		break;
	case 40:
		keyDownPressed = false;
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
