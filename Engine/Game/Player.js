define(['Engine/Utility/underscore', 'Engine/Utility/Converter','Engine/Game/KeyAction'], function( _, Converter, KeyAction ){

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
			 */
			team : 0, 
			/**
			 * @param state  
			 * 		0 for standing still
			 *		1 for walking
			 *		2 for sprinting
			 */
			state : 0 ,
			sideRight : true
		};
		
		var defaults = {
			x : 0,
			y : 0,
			vy : 0,
			team : Player.team.black,
			sideRight : true,
			isDead : false

			// vx and state is determined by keyAction
			
		}
		_.extend( this, defaults );
		_.extend( this, option );
	}
	
	Player.team = {
		black : 0,
		white : 1
	}
	
	Player.prototype = {
		walkVelocity : 300,
		sprintVelocity : 450,
		jumpVelocity : 800,

		/** a time duration before the body is removed from the world*/
		rotDuration : 2,
		hasRotten : function(){
			return this.isDead && this.hasBeenDeadFor() >= this.rotDuration;
		},
		fadeOutDuration : 0.5,
		/**
		topPlatform
			topPlatform is the platform which player is standing on
			topPlatform detection is set by world fixCoordinate function 
		*/
		topPlatform : false,
		width : 90,
		height : 140,
		update : function( keyAction, dt ){
			if( !( keyAction instanceof KeyAction ) ) throw new Error('key act is not an instanceof `KeyAction`');
			if( this.isDead ) return;
			
			// process key action
			var movementDirection, vx;
			if( keyAction.left ){
				this.sideRight = false;
				movementDirection = -1;
			}
			else if( keyAction.right ){
				this.sideRight = true;
				movementDirection = 1;
			}
			else {
				movementDirection = 0;
			}
			
			if( keyAction.sprint ){
				vx = movementDirection * this.sprintVelocity;
			}
			else {
				vx = movementDirection * this.walkVelocity;
			}
			
			if( keyAction.jump ){
				this.jump();
			}
			else if( keyAction.fall ){
				this.fall();
			}
			
			if( keyAction.shoot ){
				this.shoot();
			}			
			
			
			this.vy -= this.world.gravity * dt;

			this.x += vx * dt;
			this.y += this.vy * dt;
		},
		jump : function(){
			if( this.topPlatform && this.y - this.height == this.topPlatform.y ){
				this.vy = this.jumpVelocity;
			}
		},
		fall : function(){
			if( !this.topPlatform.penetrable ) return;
			
			this.topPlatform = false;
		},
		dieTime : 0,
		die : function(){
			this.dieTime = new Date();
			this.isDead = true;
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
				
				_.extend( option, this.getGunCoordinate() );
				option.direction = ( this.sideRight ? "right" : "left" );
				
				this.world.add( new Bullet( option ) );
			}
		},
		isReloading : function(){
			return new Date() - this.lastShoot < this.reloadSpeed * 1000
		}
	}
	
	
	var PlayerDataConverter = new Converter.BCConverter([
		{ name : 'x', type : Converter.BCConverter.type.NUMBER },
		{ name : 'y', type : Converter.BCConverter.type.NUMBER },
		{ name : 'vy', type : Converter.BCConverter.type.NUMBER },
		{ name : 'isDead', type : Converter.BCConverter.type.BOOLEAN },
		{ name : 'team', type : Converter.BCConverter.type.BOOLEAN },
		{ name : 'sideRight', type : Converter.BCConverter.type.BOOLEAN },
	], false);
	
	Player.baseConverter = PlayerDataConverter;
	
	Player.method('toBin', function(){
		return PlayerDataConverter.convertToBin( this );
	});
	
	Player.method('parseBin', function( bin ){
		var data = PlayerDataConverter.convertToClass( bin );
		_.extend( this, data );
	});
	
	return Player;
});
