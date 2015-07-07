define(['Engine/Utility/underscore','Engine/Utility/RayCast','Engine/Utility/Converter'], function( _, RayCast, Converter ){
	/***
	
	var defaults = {
		camera_x : 0,
		camera_y : 0,
		gravity : 1000,
		players : [],
		platforms : [],
		lights : [],
		bullets : []
	};
	
	//	Represent a game world
	//	@constructor
	//	@param {number} camera_x - camera horizontal coordinate
	//	@param {number} camera_y - camera vertical coordinate
	//	@param {number} gravity - world's gravity
		
	var World = function( options ){
		_.extend( this, _.clone(defaults) );
		_.extend( this, options );
	}
	
	World.prototype = {
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
				this.processBullet( item );
			}
			else {
				throw new Error('Unknown Type Added' );
			}
		},
		updateModels : function(dt){
			for( var i = 0; i < this.players.length; ++ i ){
				this.players[i].update(dt);
			}
			
		},
		fixCoordinate : function(){
			function isInBetween( bottom, data , top ){
				return bottom < data && data < top;
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
			this.physicOn = false;
		},
		turnOnPhysic : function(){
			this.physicOn = true;
		},
		timebuffer : 0,
		update : function( real_dt ){
			this.timebuffer += real_dt;
			
			// fix time update for consistency 
			var dt = this.timestep;
			
			if( this.physicOn ){
				while( this.timebuffer > dt ){
					this.updateModels(dt);
					this.fixCoordinate();
					this.timebuffer -= dt;
				}
			}

			
			//TODO : Plan if this need to be removed b/c rotten stuff can always be changed to respawned stuff

			// removing dead stuff
			//for( var i = this.players.length; i --; ){
			//	
			//	if( this.players[i].hasRotten() ){
			//		this.players.splice( i, 1 );
			//	}
			//}
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
			
			// draw dead players on top of living players 
			for( var i = 0; i < this.players.length; ++ i ){
				if( !this.players[i].isDead() ) 
					this.players[i].draw(ctx);
			}
			for( var i = 0; i < this.players.length; ++ i ){
				if( this.players[i].isDead() ) 
					this.players[i].draw(ctx);
			}
			
			// draw mods 
			for( var i = 0; i < this.players.length; ++ i ){
				this.players[i].drawMod( ctx );
			}
			
			ctx.restore();
		},
		
		/** 
		 *  Ray Cast only to platforms for lighting convenience
		 
		RayCast : function(option){
			_.extend( option, { walls : this.platforms });
			
			return RayCast( option ).range;
		},
		processBullet : function( bullet ){
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

			var result = RayCast(option);
			
			// make bullet match the range of the player killed from point shot
			item.length = result.range;
			this.bullets.push( item );

			var killedPlayer = result.wall;
			return killedPlayer;
		}
		
	}
	
	return World;
	*/
	
	var defaults = {
		camera_x : 0,
		camera_y : 0,
		gravity : 1000,
		players : [],
		platforms : [],
		lights : [],
		bullets : [],
		timestep : 0.05,
		framecount : 0
	};

	//	Represent a game world
	//	@constructor
	//	@param {number} camera_x - camera horizontal coordinate
	//	@param {number} camera_y - camera vertical coordinate
	//	@param {number} gravity - world's gravity
		
	var World = function( options ){
		_.extend( this, _.clone(defaults) );
		_.extend( this, options );
	}
	
	var WorldBaseConverter = new Converter.BCConverter([
		{ name : 'gravity', type : Converter.BCConverter.type.NUMBER },
		{ name : 'timestep', type : Converter.BCConverter.type.NUMBER },
		{ name : 'framecount', type : Converter.BCConverter.type.NUMBER }
	]);
	
	World.prototype.parseBaseBin = function( bin ){
		_.extend( this, WorldBaseConverter.convertToClass( bin ) );
	}
	
	World.prototype.getBaseBin = function(){
		return WorldBaseConverter.convertToBin( this );
	}
	
	return World;

});
