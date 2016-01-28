/********************************
* Revival Version of Black White Shooter project 
* 	Rewriting the code to use backbone MVC
*	All logic will be maintained
*	
* Author : rmxhaha 
*********************************/

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
		width : 0,
		penetrable : true
		/**
		 *  @param penetrable
		 *  	penetrable from above, when player request to fall 
		 *  	if the current platform is penetrable he can fall
		 */
	}
	/**
		If you are looking for `height` variable.
		The platform is only impenetrable from above 
		so the height is only for drawing purposes
		so it doesn't exist here anymore
	*/
});

var Player = Backbone.Model.extend({
	defaults : {
		x : 0,
		y : 0,
		vy : 0,
		vx : 0,
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
		sideRight : true,
		topPlatform : false,
		lastShoot : new Date()
	},
	initialize : function(){
		this.listenTo( this.world, 'updatePlayer', this.update );
	},
	walkVelocity : function(){ return 300; },
	sprintVelocity : function(){ return 450; },
	rotDuration : function(){ return 2; },
	fadeOutDuration : function(){ return 0.5; },
	hasRotten : function(){
		return this.isDead() && this.hasBeenDeadFor() >= this.rotDuration();
	},
	hasDisappear : function(){
		return this.isDead() && this.hasBeenDeadFor() >= this.rotDuration() + this.fadeOutDuration();		
	},
	width : function(){ return 90; },
	height : function(){ return 140; },
	update : function( dt ){
		if( this.isDead() ){
			return;
		}
		
		var movementDirection = ( this.get('sideRight') ? 1 : -1 );
		
		switch( this.get('state') ){
		case 0:
			this.set('vx', 0 );
			break;
		case 1:
			this.set('vx', movementDirection * this.walkVelocity() );
			break;
		case 2:
			this.set('vx', movementDirection * this.sprintVelocity() );
			break;
		}

		this.set('vy', this.get('vy') - this.get('world').gravity * dt );

		this.set('x', this.get('x') + this.get('vx') * dt );
		this.set('y', this.get('y') + this.get('vy') * dt );
	},
	jump : function(){
		if( this.get('topPlatform') && this.get('y') - this.height() == this.topPlatform.get('y') ){
			this.set('vy', 800 );
		}
	},
	goLeft : function(){
		this.set('sideRight', false );
		this.walk();
	},
	goRight : function(){
		this.set('sideRight', true );
		this.walk();
	},
	
	standStill 	: function(){ this.set('state', 0 ); },
	walk 		: function(){ this.set('state', 1 ); },
	sprint 		: function(){ this.set('state', 2 ); },
	
	isStandingStill 	: function(){ return this.get('state') == 0; },
	isWalking 			: function(){ return this.get('state') == 1; },
	isSprinting 		: function(){ return this.get('state') == 2; },
	
	fall : function(){
		if( !this.get('topPlatform').penetrable ) return;
		
		// override ground below
		this.set('topPlatform', false );
	},
	
	die : function(){
		if( ! this.isDead() ){
			this.set('type', 2 );
			this.set('dieTime', new Date());
			this.trigger('death');
			setTimeout( 
				function(){ this.trigger('rot'); }, 
				this.rotDuration()
			);
			setTimeout(
				function(){ this.trigger('disappear') },
				this.rotDuration() + this.fadeOutDuration()
			);
		}
	},
	
	isDead : function(){ return this.get('type') == 2; },
	hasBeenDeadFor : function(){ return (new Date() - this.get('dieTime')) / 1000; },
	reloadSpeed : function(){ return 3; }, // seconds
	shoot : function(){
		if( !this.isReloading() ){
			this.set('lastShoot', new Date() );
			var option = {};
			
			_extend( option, this.getGunCoordinate() );
			option.direction = ( this.sideRight ? "right" : "left" );
			
			this.world.add( new Bullet( option ) );
		}
	},
	getGunCoordinate : function(){
		if( this.get('sideRight') ){
			return { 
				x : this.get('x') + this.width() + 10, 
				y : this.get('y') - 100 
			};
		}
		else {
			return { 
				x : this.get('x') - 10, 
				y : this.get('y') - 100 
			};
		}
	},
	isReloading : function(){
		return new Date() - this.get('lastShoot') < this.reloadSpeed() * 1000
	}
});
/*

var Players = Backbone.Collection.extend({
	model : Player
});

var Platforms = Backbone.Collection.extend({
	model : Platform
});

var Lights = Backbone.Collection.extend({
	model : Light
});

var Bullets = Backbone.Collection.extend({
	model : Bullet
});

var World = Backbone.Model.extend({
	defaults : {
		camera_x : 0,
		camera_y : 0,
		gravity : 1000,
		timestep : 0.05
	},
	initialize : function(){
		this.set('players', new Players );
		this.set('platforms', new Platforms );
		this.set('lights', new Lights );
		this.set('bullets', new Bullets );
	},
	add : function( item )
	{
		// adding pointer to the world where they belong
		item.set('world', this );
		
		if( item instanceof Platform ){
			this.get('platforms').push( item );
		}
		else if( item instanceof Player ){
			this.get('players').push( item );
		}
		else if( item instanceof Light ){
			this.get('lights').push( item );
		}
		else if( item instanceof Bullet ){
			this.applyBulletToPlayers( item );
			this.get('bullets').push( item );
		}
		else {
			throw new Error('Unknown Type Added' );
		}
	},
	applyBulletToPlayers : function(){

	}
	
});

*/
