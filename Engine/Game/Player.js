define(['Engine/Utility/underscore'], function( _ ){

	function Player( option ){
		var defaults = {
			/** default parameter */
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
			sideRight : true

		};
		_.extend( this, defaults );
		_.extend( this, option );
	}
	
	Player.prototype = {
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
		topPlatform : false,
		width : 90,
		height : 140,
		update : function( dt ){
			if( this.isDead() ){
				return;
			}
			
			var movementDirection = ( this.sideRight ? 1 : -1 );
			
			switch( this.state ){
			case 0:
				this.vx = 0;
				break;
			case 1:
				this.vx = movementDirection * this.walkVelocity;
				break;
			case 2:
				this.vx =  movementDirection * this.sprintVelocity;
				break;
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
			this.walk();
			this.sideRight = false;
		},
		goRight : function(){
			if ( this.isDead() ) return;
			this.walk();
			this.sideRight = true;		
		},
		standStill : function(){
			this.state = 0;
		},
		walk : function(){
			this.state = 1;
		},
		sprint : function(){
			this.state = 2;
		},
		isWalking : function(){ return this.state == 1; },
		isSprinting : function(){ return this.state == 2; },
		isStandingStill : function(){ return this.state == 0; },
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
	
	
	return Player;
});
