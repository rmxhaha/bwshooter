define([
	'Engine/Utility/underscore',
	'Engine/Utility/raycast',
	'Engine/Utility/converter',
	'Engine/Game/Platform',
	'Engine/Game/Light',
	'Engine/Game/Player',
	'Engine/Game/KeyAction'
], function( 
	_, RayCast, Converter,
	Platform, 
	Light,
	Player,
	KeyAction
){
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
		removed_player : [], // player in world.players that is removed which will be purge after each update right after postupdate
		added_player : [], // same as removed_player but this time it's player in world.players that is just added
		platforms : [],
		lights : [],
		bullets : [],
		timestep : 0.05,
		framecount : 0,
		postupdate : function(){}, // called after update
		physicOn : true
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
	
	var WorldBaseConverter = new Converter.BCConverter({
		gravity : Converter.type.FLOAT,
		timestep : Converter.type.FLOAT,
		framecount : Converter.type.INTEGER,
		platforms : Converter.type.PSTRING,
		lights : Converter.type.PSTRING,
		players : Converter.type.PSTRING,
	});
	
	var WorldUpdateConverter = new Converter.ClassConverter({
		lights : Converter.type.PSTRING,
		players : Converter.type.PSTRING,
		framecount : Converter.type.INTEGER,
		added_player : Converter.type.PSTRING,
		removed_player : Converter.type.PSTRING
	}, true);
	
	var PlatformsArrayConverter = new Converter.ArrayConverter( Platform.converter, true );
	var LightsArrayConverter = new Converter.ArrayConverter( Light.baseConverter, true );
	var LightArrayUpdateConverter = new Converter.ArrayConverter( Light.updateConverter, true );
	var PlayerArrayConverter = new Converter.ArrayConverter( Player.baseConverter, false );
	var PlayerArrayUpdateConverter = new Converter.ArrayConverter( Player.updateConverter, false );
	var RemovedPlayerArrayConverter = new Converter.PrimitiveArrayConverter( Converter.type.NUMBER, false );

	World.prototype.parseBaseBin = function( bin ){
		var data = WorldBaseConverter.convertToClass( bin );

		_.extend( this, _.pick( data, 'gravity','timestep','framecount' ) );
		
		// debug
		this.platforms = [];
		this.lights = [];
		this.lastFrameUpdate = this.framecount;
		
		_.each( PlatformsArrayConverter.convertToArray( data.platforms ), function(p){ this.add( new Platform( p ) );}.bind(this));
		_.each( LightsArrayConverter.convertToArray( data.lights ), function(p){ this.add( new Light( p ) );}.bind(this));
		_.each( PlayerArrayConverter.convertToArray( data.players ), function(p){ this.add( new Player(p)); }.bind(this));
	}
	
	World.prototype.getBaseBin = function(){
		var data = _.pick( this, 'gravity','timestep','framecount' );
		data.platforms = PlatformsArrayConverter.convertToBin( this.platforms );
		data.lights = LightsArrayConverter.convertToBin( this.lights );
		data.players = PlayerArrayConverter.convertToBin( this.players );

		var bin = WorldBaseConverter.convertToBin( data );
		return bin;
	}
	
	World.prototype.parseUpdateBin = function( bin, latency ){ // latency is in seconds
		var data = WorldUpdateConverter.convertToClass( bin );

		// remove player
		var removed_ids = RemovedPlayerArrayConverter.convertToArray( data.removed_player );
		
		if( removed_ids.length > 0 ){
			var world = this;
			var pids = world.players.map(function(p){ return p.id; });

			_.each( removed_ids, function(id){
				var i = _.indexOf(pids, id, true);
				console.log( id );
				if( i == -1 )
					throw new Error('removed player not found');

				pids.splice(i,1);
				world.players.splice(i,1);
			});
		}
		
		
		// added player
		_.each( PlayerArrayConverter.convertToArray( data.added_player ), function(p){ this.add( new Player(p)); }.bind(this));
		
		
		
		// do interpolation here
		var lightsUpdate = LightArrayUpdateConverter.convertToArray( data.lights );
		var playerUpdate = PlayerArrayUpdateConverter.convertToArray( data.players );

		if( this.players.length != playerUpdate.length )
			throw new Error('players count and player update is not synchronized');

		for( var i = 0; i < lightsUpdate.length; ++ i ){
			this.lights[i].parseUpdate( lightsUpdate[i] );
		}
		
		for( var i = 0; i < playerUpdate.length; ++ i ){
			this.players[i].parseUpdate( playerUpdate[i] );
		}
		
		this.framecount = data.framecount;

		// interpolate
		//this.update( latency / 2 );
		this.update( this.timestep * (bin.framecount-this.lastFrameUpdate));
		
		
		this.lastFrameUpdate = bin.framecount;
	}
	
	// although I want getUpdateBin to be independently called
	// I can't be due to design issue
	// getUpdateBin must be called in the postupdate
	// world.update function will removed world.added_player and world.removed_player after each update 
	// it will be deleted them exactly after postupdate has been called
	
	World.prototype.getUpdateBin = function(){
		var data = _.pick( this, 'framecount');
		
		var removed_ids = this.removed_player.map(function(p){ return p.id;});
		
		data.removed_player = RemovedPlayerArrayConverter.convertToBin( removed_ids );
		data.added_player = PlayerArrayConverter.convertToBin( this.added_player );
		data.lights = LightArrayUpdateConverter.convertToBin( this.lights );
		data.players = PlayerArrayUpdateConverter.convertToBin( this.players );
		return WorldUpdateConverter.convertToBin( data );
	} 
	
	
	_.extend( World.prototype, {
		add : function( item ){
			item.world = this;
			if( item instanceof Platform ){
				this.platforms.push( item );
			}
			else if( item instanceof Light ){
				this.lights.push( item );
			}else if( item instanceof Player ){
				// set id of player
				if( item.id == 0 ) 
					item.id = this.getVacantPlayerId();
				
				console.log("ADDED" + item.id );
				
				// this.players must be ordered by id

				var head = 0;
				
				if( this.players.length != 0 ){
					// bin search lower bound
					var i, step;
					var count = this.players.length;
					while( count > 0 ){
						i = head;
						step = Math.floor( count/2 );
						i += step;
						if( this.players[i].id < item.id ){
							head = ++ i;
							count -= step + 1;
						}
						else 
							count = step;
					}
				}
				
				this.players.splice( head, 0, item );
				this.added_player.push( item );
			}
			else {
				throw new Error('type not found');
			}
		},
		
		// remove is server only code, runned on client side will cause problem
		remove : function(item){
			if( item instanceof Player ){
				var idx = this.players.indexOf(item);
				if( idx == -1 ) 
					throw new Error('player not found on this world');
				
				this.players.splice(idx,1);
				this.removed_player.push( item );
			}
			else {
				throw new Error('type not found');				
			}
		},
		timebuffer : 0,
		update : function( real_dt ){
			this.timebuffer += real_dt;
			
			// fix time update for consistency 
			var dt = this.timestep;
			
			while( this.timebuffer > dt ){
				updateLights.bind(this)(dt);
				this.timebuffer -= dt;

				if( this.physicOn ){
					updateModels.bind(this)(dt);
					this.fixCoordinate();					
				}
				
				this.framecount ++;
			}
			
			function updateLights(dt){
				_.each( this.lights, function(light){
					light.update(dt);
				});
			}
			
			function updateModels(){
				for( var i = 0; i < this.players.length; ++ i ){
					this.players[i].update(new KeyAction(), dt);
				}
			}
			
			// call post update
			this.postupdate();
			
			// purge added_player and removed_player
			this.added_player.length = 0;
			this.removed_player.length = 0;
			
		}
	});
	
	_.extend( World.prototype, {
		/** 
		 *  Ray Cast only to platforms for lighting convenience
		 */
		RayCast : function(option){
			_.extend( option, { walls : this.platforms });
			
			return RayCast( option ).range;
		},
		getVacantPlayerId : function(){
			// warning : 
			// this function work under the assumption that
			// this.players doesn't contain more than equal 65535
			// the theoritical number of player is 65535 because id is sent as int16 when this function is written

			if( this.players.length == 0 ) // all is vacant
				return 1; // default first id
			
			var world = this;

			function noVacant(i){
				return world.players[i].id == i + 1;
			}
			
			if( noVacant( this.players.length-1 ) )
				return this.players.length+1;
			else {
				function f(head,tail){
					if( head == tail ) return head;
					var center = Math.floor( head + ( tail - head ) / 2 );
					
					if( noVacant(center) )
						return f(center+1,tail);
					else
						return f(head,center);
				}
				
				var i = f(0,this.players.length);
				if( i == 0 ) return 1;
				
				return this.players[i-1].id + 1;
			}
		}

	});

	_.extend( World.prototype, {
		turnOffPhysic : function(){
			this.physicOn = false;
		},
		turnOnPhysic : function(){
			this.physicOn = true;
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
		}
	});

	return World;
});
