/**
 *  Unit Guide
 *  	Time 								is in seconds
 *  	Length, Width, Height 				is in pixel
 *  	Angle								is in radian
 *  	Velocity, Acceleration, Gravity 	is in pixel
 *  	Speed								is in swings, rotation, etc.
 *
 *  Class Parameter Guide
 *  	function name(){
 *  		constructor ...
 *  	}
 *  	
 *  	name.prototype = {
 *  		defaultValueParam : ...,
 *  		privateVariable : .. ,
 *  		method : ...
 *  	}
 *  
 *  Mod 
 *  	{
 *  		update : function
 *  		draw : function
 *  		getAllProperties : function
 *  		setProperties : function
 *  		object : {}  # pointer to the object that runs this mod
 *  	}
 */

 var global = ( global ? global : window );


/**
 *  extend one array with another
 */
function _extend(x, y) {
	for (var key in y) {
		if (y.hasOwnProperty(key)) {
			x[key] = y[key];
		}
	}

	return x;
}


/**
 *  @example
 *  var Tank = Class(
 *  	_default : {
 *  		x : 0,
 *  		y : 0,
 *  		size : 50
 *  	},
 *  	_private : {
 *  		goForward : function(){ ... },
 *  		staticVar : 500
 *  	}
 *  );
 */
 
function copy( arr ){
	if( typeof arr !== 'object' ) return arr;
	if( arr.getAllProperties ){
		return arr.getAllProperties();
	}
	
	var all = ( arr instanceof Array ? [] : {});
	for( var i in arr ){
		all[i] = copy( arr[i] );
	}
	
	return all;
}

var Class = function(setup){
	var s = _extend( { _default : [], _private : [], _constructor : function(){} }, setup );
	
	var c = function(option){
		_extend( this, copy( s._default ) );
		_extend( this, option );
		s._constructor.bind( this )();
	};
	
	_extend( c.prototype, s._private );
	_extend( c, {
		// only extends private
		extend : function( _private ){
			_extend( this.prototype, _private );
		}
	});

	var paramList = [];
	for( var index in s._default ){
		paramList.push( index );
	}
	
	_extend( c.prototype, {
		setProperties : function( prop ){
			_extend( this, prop );
		},
		getAllProperties : function(){
			var all = {};
			
			for( var i in paramList ){
				all[ paramList[i] ] = copy( this[ paramList[i] ] );
			}
			
			return all;
		}

	});
	
	return c;
}

/**
 *  Bar in circular form
 */
function CircularBarUI(option){
	/** The default parameter value*/
	var _default = {
		x : 0,
		y : 0,
		outerWidth : 100,
		innerWidth : 90,
		startAngle : 0,
		endAngle : Math.PI,
		color : "yellow",
		opacity : 0.5
	};
	
	_extend( this, _default );
	_extend( this, option );
}

CircularBarUI.prototype = {
	/**
	 *  Apply new property to the class in bulk
	 */
	apply : function(opt){
		_extend( this, opt );
	},
	draw : function(ctx){
		ctx.save();

		ctx.fillStyle = this.color;
		ctx.globalAlpha = this.opacity;

		ctx.beginPath();
		ctx.arc( this.x, -this.y, this.outerWidth, this.startAngle, this.endAngle, true  );
		ctx.arc( this.x, -this.y, this.innerWidth, this.endAngle, this.startAngle, false );
		ctx.closePath();

		ctx.fill();
		ctx.restore();
	}
};

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

var ModPrototype = {
	initMod : function(){
		if( this.modInitialized ) return;
		this.modInitialized = true;
		
		this.mod = [];
	},
	addMod : function( option ){
		this.initMod();
		
		var mod = new global[option.name]( option );
		mod.object = this;
		
		this.mod.push( mod );		
	},
	updateMod : function( dt ){
		if( !this.modInitialized ) return;

		for( var i = 0; i < this.mod.length; ++ i ){
			if( !this.mod[i].update ) continue;

			this.mod[i].update( dt );
		}
	},
	drawMod : function(ctx){
		if( !this.modInitialized ) return;

		for( var i = 0; i < this.mod.length; ++ i ){
			if( !this.mod[i].draw ) continue;
			
			this.mod[i].draw( ctx );
		}		
	}
};

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


var World = Class({
	_default : {
		camera_x : 0,
		camera_y : 0,
		gravity : 1000,
		players : [],
		platforms : [],
		lights : [],
		bullets : []
	},
	_private : {
		timestep : 0.05,
		
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
			else if( item instanceof Bullet ){
				this.applyBulletToPlayers( item );
				this.bullets.push( item );
			}
			else {
				throw new Error('Unknown Type Added' );
			}
		},
		updateEntities : function(dt){
			for( var i = 0; i < this.players.length; ++ i ){
				this.players[i].update(dt);
			}
			
		},
		updateMods : function(dt){
			for( var i = 0; i < this.players.length; ++ i ){
				this.players[i].updateMod( dt );
			}
			
			for( var i = 0; i < this.lights.length; ++ i ){
				this.lights[i].updateMod( dt );
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
						continue;
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

		physicOn : true,
		turnOffPhysic : function(){
			physicOn = false;
		},
		turnOnPhysic : function(){
			physicOn = true;
		},
		timebuffer : 0,
		update : function( real_dt ){
			this.timebuffer += real_dt;
			
			/** fix time update for consistency */
			var dt = this.timestep;
			
			if( this.physicOn ){
				while( this.timebuffer > dt ){
					this.updateEntities(dt);
					this.fixCoordinate();
					this.timebuffer -= dt;
				}
			}
				
			/** update that doesn't concern physical coordination */
			this.updateMods( real_dt );

			// removing dead stuff
			for( var i = this.players.length; i --; ){
				
				if( this.players[i].hasRotten() ){
					this.players.splice( i, 1 );
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
			for( var i = 0; i < this.bullets.length; ++ i ){
				this.bullets[i].draw(ctx);
			}
			
			/* draw dead players on top of living players */
			for( var i = 0; i < this.players.length; ++ i ){
				if( !this.players[i].isDead() ) 
					this.players[i].draw(ctx);
			}
			for( var i = 0; i < this.players.length; ++ i ){
				if( this.players[i].isDead() ) 
					this.players[i].draw(ctx);
			}
			
			/** draw mods */
			for( var i = 0; i < this.players.length; ++ i ){
				this.players[i].drawMod( ctx );
			}
			
			ctx.restore();
		},
		
		/** 
		 *  Ray Cast only to platforms for lighting convenience
		 */
		RayCast : function(option){
			_extend( option, { walls : this.platforms });
			
			return RayCast( option ).range;
		},
		applyBulletToPlayers : function( bullet ){
			var livingPlayer = [];
			
			for( var i = 0; i < this.players.length; ++ i ){
				if( this.players[i].isDead() ) continue;

				livingPlayer.push( this.players[i] );
			}
			
			var option = {
				x : bullet.x,
				y : bullet.y,
				tx : bullet.x + bullet.length,
				ty : bullet.y,
				walls : livingPlayer
			};

			var killedPlayer = RayCast(option).wall;
			if( killedPlayer ) killedPlayer.die();
		}
		
	}
});

var Platform = Class({
	_default : {
		x : 0,
		y : 0,
		width : 100,
		/**
		 *  @param penetrable
		 *  	penetrable from above, when player request to fall 
		 *  	if the current platform is penetrable he can fall
		 */
		penetrable : true
	},
	_private : {
		draw : function(ctx){
			ctx.save();
			ctx.fillStyle = "#888888";
			ctx.fillRect( this.x, -this.y, this.width, this.height );
			ctx.restore();
		},
		height : 30
		
	}
});


var Player = Class({
	_constructor : function(){
		this.initMod();
	},
	_default : {
		/** default parameter */
		x : 0,
		y : 0,
		vy : 0,
		vx : 0,
		/**
		 *  Player class	
		 *   @param type 
		 *  	0 for black 
		 *  	1 for white
		 *  	2 for dead
		 */
		type : 0, 
		/**
		 *   @param main
		 *  	state whether this player is being played the user
		 */
	},
	_private : {
		main : false,
		walkVelocity : 150,
		/** a time duration before the body is removed from the world*/
		rotDuration : 2,
		hasRotten : function(){
			return this.isDead() && this.hasBeenDeadFor() >= this.rotDuration;
		},
		fadeOutDuration : 0.5,
		draw : function (ctx) {
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
				var duration = this.hasBeenDeadFor();

				if( duration < this.rotDuration - this.fadeOutDuration ){
					ctx.fillStyle = "red";
					ctx.globalAlpha = 1;
				}
				else if( duration < this.rotDuration ){
					ctx.fillStyle = "red";
					ctx.globalAlpha = 1 - (duration - this.rotDuration + this.fadeOutDuration) / this.fadeOutDuration;
				}
				else {
					ctx.globalAlpha = 0;
				}
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
					
					ctx.save();
					ctx.globalAlpha = 0.2;
					ctx.stroke();
					ctx.restore();;
				}
			}
			else {
				applyToScreen = function(){
					ctx.fill();
				}
			}
						
			ctx.translate( Math.floor( this.x ), -Math.floor( this.y ) );
						
			ctx.beginPath();

			// draw head
			ctx.beginPath();
			ctx.arc( 45, 50,50,Math.PI*116.5/180,2.353*Math.PI);

			// draw body
			ctx.lineTo( this.width, this.height );			
			ctx.lineTo( 0, this.height );
			ctx.closePath();
			
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
		},
		sideRight : true, 
		topPlatform : false,
		width : 90,
		height : 140,
		update : function( dt ){
			if( this.isDead() ){
				return;
			}

			this.vy -= this.world.gravity * dt;
			this.x += this.vx * dt;
			this.y += this.vy * dt;
			
		},
		jump : function(){
			if( this.topPlatform && this.y - this.height == this.topPlatform.y ){
				this.vy = 800;
			}
		},
		goLeft : function(){
			if ( this.isDead() ) return;
			this.vx = -this.walkVelocity;
			this.sideRight = false;
		},
		goRight : function(){
			if ( this.isDead() ) return;
			this.vx = this.walkVelocity;
			this.sideRight = true;		
		},
		fall : function(){
			if( !this.topPlatform.penetrable ) return;
			
			this.topPlatform = false;
		},
		dieTime : 0,
		die : function(){
			this.dieTime = new Date();
			this.type = 2;
		},
		isDead : function(){
			return this.type == 2;
		},
		hasBeenDeadFor : function(){
			return (new Date() - this.dieTime) / 1000;
		},
		getGunCoordinate : function(){
			if( this.sideRight ){
				return { x : this.x + this.width + 10, y : this.y - 100 };
			}
			else {
				return { x : this.x - 10, y : this.y - 100 };
			}
		},
		lastShoot : 0,
		reloadSpeed : 3,
		shoot : function(){
			if( !this.isReloading() ){
				this.lastShoot = new Date();
				var option = {};
				
				_extend( option, this.getGunCoordinate() );
				option.direction = ( this.sideRight ? "right" : "left" );
				
				this.world.add( new Bullet( option ) );
			}
		},
		isReloading : function(){
			return new Date() - this.lastShoot < this.reloadSpeed * 1000
		}
	}
});

Player.extend( ModPrototype )

var Light = Class({
	_constructor : function(){
		this.initMod();
	},
	_default : {
		x : 0,
		y : 0,
		maxRange : 400,
		rayCount : 100,
		color : "red",
		opacity : 1,
		direction : 0, // in radian
		width : Math.PI*2, // in radian
		state : true, // true for on and false of off
		mod : []
	},
	_private : {
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
		}
	}
});

Light.extend( ModPrototype );

var LightFlickeringMod = Class({
	_default : {
		name : "LightFlickeringMod",
		onDuration : 1,
		flickerDuration : 0.6,
		flickerSpeed : 0.2
	},
	_private : {
		object : false,
		time : 0,
		update : function( dt ){
			var light = this.object;
			this.time += dt;
			
			// round it down
			this.time %= this.flickerDuration + this.onDuration;
			
			if( this.time < this.flickerDuration ){
				if( Math.floor( this.time / this.flickerSpeed ) % 2 == 0 ) 
					light.turnOn();
				else 
					light.turnOff();
			}
			else { // time < flickerDuration + onDuration
				light.turnOn();
			}
			
		}
	}
});

var LightSwingingMod = Class({
	_default : {
		name : "LightSwingingMod",
		speed : 0.5,
		angleDeviation : Math.PI/10,
		angleBase : Math.PI,
		deg : 0
	},
	_private : {
		object : false,
		update : function(dt){
			var light = this.object;
			
			light.direction = this.angleBase + Math.sin( this.deg ) * this.angleDeviation;
			this.deg += this.speed*Math.PI*2 * dt;
		}
	}
});


var SunFxMod = Class({
	_default : {
		name : "SunFxMod",
		dayTime : 30, 
		nightTime : 30,
		switchTime : 3,
		maxOpacity : 1		
	},
	_private : {
		time : 0,
		update : function( dt ){
			var sun = this.object;
			
			this.time += dt;
						
			this.time %= this.dayTime + this.switchTime + this.nightTime + this.switchTime;
			
			if( this.time < this.dayTime ){
				sun.opacity = this.maxOpacity;
			}
			else if( this.time < this.dayTime + this.switchTime ){
				// relative time
				var rTime = this.time-this.dayTime;

				sun.opacity = Math.cos( rTime / this.switchTime * Math.PI/2 ) * this.maxOpacity;
			}
			else if( this.time < this.dayTime + this.switchTime + this.nightTime ){
				sun.opacity = 0;
			}
			else {
				var rTime = this.time-this.dayTime-this.switchTime-this.nightTime;

				sun.opacity = Math.sin( rTime / this.switchTime * Math.PI/2 );			
			}
		}
	}
});

var reloadBarMod = Class({
	_default : {
		name : "reloadBarMod"
	},
	_constructor : function(){
		this.UI = new CircularBarUI({
			innerWidth : this.innerWidth,
			outerWidth : this.outerWidth,
			endAngle : this.endAngle
		});
		
		
	},
	_private : {
		innerWidth : 90,
		outerWidth : 100,
		endAngle : -Math.PI / 4,
		
		draw : function( ctx ){
			var player = this.object;
			var UI = this.UI;
			
			if( !player.isReloading() ) return;

			var d = new Date() - player.lastShoot;
			var frac = d / (player.reloadSpeed*1000);

			UI.apply({
				x : player.x + player.width/2,
				y : player.y - player.height/2,
				startAngle : frac*Math.PI*2 + UI.endAngle
			});
			
			UI.draw( ctx );
		}
	}
});


var Bullet = Class({
	_default : {
		x : 0,
		y : 0
	},
	_private : {
		length : 300,
		timeFired : 0,
		animationDuration : 0.4,
		initHeight : 10,
		draw : function(ctx){
			// animation Function
			function Af(t){ return 1 - t*t*t*t; }
			
			var height = Math.max(0, Af( ( new Date() - this.timeFired ) / 1000 / this.animationDuration) ) * this.initHeight;
			
			ctx.save();
			ctx.fillStyle = "yellow";
			ctx.fillRect( this.x, -this.y - height/2, this.length, height );
			ctx.restore();
		}
	},
	_constructor : function(){
		if( this.direction && this.direction == "left" ){
			// bullet is going left
			this.x -= this.length;			
		}
		
		this.timeFired = new Date();
	}
});

