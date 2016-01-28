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
		vy : 0,
		/**
		 *   @param type 
		 *  	0 for black 
		 *  	1 for white
		 *  	2 for dead
		 */
		type : 0, 
		/**
		 * @param state  
		 * 		0 for standing still
		 *		1 for walking
		 *		2 for sprinting
		 */
		state : 0 ,
		sideRight : true
	},
	/**
	 *   @param main
	 *  	state whether this player is being played the user
	 */
	main : false,

	walkVelocity : 300,
	sprintVelocity : 450,

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
					
		ctx.translate( Math.floor( this.get('x') ), -Math.floor( this.get('y') ) );
					
		ctx.beginPath();

		// draw head
		ctx.beginPath();
		ctx.arc( 45, 50, 50, Math.PI*116.5/180,2.353*Math.PI);

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
	topPlatform : false,
	width : 90,
	height : 140,
	update : function( dt ){
		if( this.isDead() ){
			return;
		}
		
		var that = this.attributes;
		
		var movementDirection = ( that.sideRight ? 1 : -1 );
		
		switch( this.get('state') ){
		case 0:
			this.set('vx', 0 );
			break;
		case 1:
			this.set('vx', movementDirection * this.walkVelocity );
			break;
		case 2:
			this.set('vx', movementDirection * this.sprintVelocity );
			break;
		}

		this.set('vy', that.vy - this.world.gravity * dt );
		
		this.set('x',
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
		this.walk();
		this.sideRight = false;
	},
	goRight : function(){
		if ( this.isDead() ) return;
		this.walk();
		this.sideRight = true;		
	},
	standStill : function(){
		this.set('state', 0 );
	},
	walk : function(){
		this.set('state', 1 );
	},
	sprint : function(){
		this.set('state', 2 );
	},
	isWalking : function(){ return this.get('state') == 1; },
	isSprinting : function(){ return this.get('state') == 2; },
	isStandingStill : function(){ return this.get('state') == 0; },
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
});

var MainPlayer = Player.extend({
	
});

var x = new Player();


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




