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
	camera_x : 0,
	camera_y : 0,
	gravity : 800,
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
		ctx.save();
		ctx.translate( this.camera_x, this.camera_y );
		for( var i = 0; i < this.lights.length; ++ i ){
			this.lights[i].draw(ctx);
		}
		for( var i = 0; i < this.platforms.length; ++ i ){
			this.platforms[i].draw(ctx);
		}
		for( var i = 0; i < this.players.length; ++ i ){
			this.players[i].draw(ctx);
		}
		ctx.restore();
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
	/**
	 *  @param penetrable
	 *  	penetrable from above, when player request to fall 
	 *  	if the current platform is penetrable it can 
	 */
	var _default = {
		x : 0,
		y : 0,
		width : 100,
		penetrable : true
	};

	_extend(this, _default);
	_extend(this, setup);
}

Platform.prototype = {
	draw : function(ctx){
		ctx.save();
		ctx.fillStyle = "#888888";
		ctx.fillRect( this.x, -this.y, this.width, this.height );
		ctx.restore();
	},
	height : 30
};

function Player(setup) {
	/**
	 *  Player class	
	 *   @param type 
	 *  	0 for black 
	 *  	1 for white
	 *  	2 for dead
	 *   @param main
	 *  	state whether this player is being played the user
	 */

	var _default = {
		x : 0,
		y : 0,
		vy : 0,
		vx : 0,
		walkSpeed : 150,
		type : 0, 
		main : false 
	};

	_extend(this, _default);
	_extend(this, setup);
}

Player.prototype = {
	draw : (function () {
		return function (ctx) {
			ctx.save();

			// drawing hero manually 
			
			switch( this.type ){
			case 0:
				ctx.fillStyle = "black";
				break;
			case 1:
				ctx.fillStyle = "white";
				break;
			case 2:
				ctx.fillStyle = "red";
			}

			if( !this.isDead() && this.main ){
				// apply highlighting
				ctx.strokeStyle = ( this.type == 0 ? "white" : "black" );
				ctx.lineWidth = 3;
			}
			
			var applyToScreen;
			if( this.main ){
				applyToScreen = function(){
					ctx.fill();
					ctx.globalAlpha = 0.2;
					ctx.stroke();
					ctx.globalAlpha = 1;
				}
			}
			else {
				applyToScreen = function(){
					ctx.fill();
				}
			}
						
			ctx.translate( Math.floor( this.x ), -Math.floor( this.y ) );
			
			// draw body
			ctx.beginPath();
			ctx.moveTo( 45, 50 );
			ctx.lineTo( 0, this.height );
			ctx.lineTo( this.width, this.height );			
			ctx.closePath();
			applyToScreen();
			
			// draw head
			ctx.beginPath();
			ctx.arc( 45, 50,50,Math.PI*116.5/180,2.353*Math.PI);
			applyToScreen();
			

			// draw gun
			if( !this.sideRight ){
				// mirror the drawing if siding left
				ctx.scale(-1, 1);
				ctx.translate( -this.width, 0 );
			}

			ctx.beginPath();

			ctx.moveTo( 80, 111 );
			ctx.lineTo( 83, 93 );
			ctx.lineTo( 111, 93 );
			ctx.lineTo( 105, 102 );
			ctx.lineTo( 92, 102 );
			ctx.lineTo( 87, 112 );
			ctx.closePath();
			applyToScreen();

			ctx.restore();
		}
	})(),
	sideRight : true, 
	width : 90,
	height : 140,
	update : function( dt ){
		if( this.isDead() ){
			this.dieTime += dt;
			return;
		}

		this.vy -= this.world.gravity * dt;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
		
	},
	jump : function(){
		if( this.topPlatform && this.y - this.height == this.topPlatform.y ){
			this.vy = 600;
		}
	},
	goLeft : function(){
		if ( this.isDead() ) return;
		this.vx = -this.walkSpeed;
		this.sideRight = false;
	},
	goRight : function(){
		if ( this.isDead() ) return;
		this.vx = this.walkSpeed;
		this.sideRight = true;		
	},
	fall : function(){
		if( !this.topPlatform.penetrable ) return;
		
		this.topPlatform = false;
	},
	dieTime : 0,
	die : function(){
		this.type = 2;
	},
	isDead : function(){
		return this.type == 2;
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
	direction : 0, // in radian
	width : Math.PI*2, // in radian
	state : true, // true for on and false of off
	turnOn : function(){
		this.state = true;
	},
	turnOff : function(){
		this.state = false;
	},
	draw : function( ctx ){
		if( !this.state ) return;
		
		var ddeg = Math.PI * 2 / this.rayCount;
		var x = [this.x];
		var y = [this.y];
		
		var mRange = this.maxRange;
		
		var deg = this.direction - this.width/2;
		var limit = this.direction + this.width/2;
		
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
			if( Math.floor( time / setup.flickerSpeed ) % 2 == 0 ) 
				this.turnOn();
			else 
				this.turnOff();
		}
		else { // time < flickerDuration + offDuration
			this.turnOff();
		}
	}
}

function LightSwingingMod(option){
	var setup = {
		speed : 0.5, // in swing
		angleDeviation : Math.PI/10,
		angleBase : Math.PI
	};
	
	_extend( setup, option );
	
	setup.speed *= Math.PI*2; // change metrics to radian
	
	var deg = 0;
	return function( dt ){
		this.direction = setup.angleBase + Math.sin( deg ) * setup.angleDeviation;
		deg += setup.speed * dt;
	}
}

function SunFxMod(option){
	if( typeof option !== "object" ) option = {};
	// in seconds
	var setup = {
		dayTime : 30, 
		nightTime : 3,
		switchTime : 30
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

var world = new World;

var one = new Player({
		x : 100,
		y : -200,
		vy : 0,
		vx : 0,
		walkSpeed : 150,
		type : 0,
		main : true
	});

function focusCamera(){
	world.camera_x = -one.x + window.innerWidth/2 - one.width/2;
	world.camera_y = one.y + window.innerHeight/2 - one.height/2;
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

world.add( new Platform({ x : -1000, y : -1000, width : 3000, penetrable : false }) );

var light2 = new Light({x : 250, y : -640, color : "white", opacity : 1, rayCount : 400, width : Math.PI/4, maxRange : 1000 });

light2.addMod( LightSwingingMod({ speed : 0.2 }) );
//light2.addMod( LightFlickeringMod() );

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
		one.goLeft();
		break;
	case 39: // right
		one.goRight();
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
