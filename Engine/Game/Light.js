define(['Engine/Utility/underscore','Engine/Utility/Converter'], function( _, Converter ){
	var defaults = {
		x : 0,
		y : 0,
		maxRange : 400,
		color : "white",
		opacity : 1,
		angle : 0, // in radian
		angleWidth : Math.PI*2, // in radian
		turnedOn : true, // true for on and false of off
		fx : {
			flicker : {
				on : false,
				onDuration : 1,
				flickerDuration : 0.6,
				flickerSpeed : 0.15,
				time : 0
			},
			swinging : {
				on : false,
				speed : 0.5,
				angleDeviation : Math.PI/10,
				angleBase : Math.PI,
				deg : 0
			},
			sun : {
				on : false,
				dayTime : 30, 
				nightTime : 30,
				switchTime : 3,
				maxOpacity : 1,
				time : 0
			}
		}
	};
	
	var LightBaseConverter = new Converter.ClassConverter({
		x : Converter.type.INTEGER,
		y : Converter.type.INTEGER,
		maxRange : Converter.type.INTEGER,
		color : Converter.type.NSTRING,
		opacity : Converter.type.FLOAT,
		angle : Converter.type.FLOAT, // in radian
		angleWidth : Converter.type.FLOAT, // in radian
		turnedOn : Converter.type.BOOLEAN, // true for on and false of off
		fx : {
			flicker : {
				on : Converter.type.BOOLEAN,
				onDuration : Converter.type.INTEGER,
				flickerDuration : Converter.type.FLOAT,
				flickerSpeed : Converter.type.FLOAT,
				time : Converter.type.FLOAT
			},
			swinging : {
				on : Converter.type.BOOLEAN,
				speed : Converter.type.FLOAT,
				angleDeviation : Converter.type.FLOAT,
				angleBase : Converter.type.FLOAT,
				deg : Converter.type.FLOAT
			},
			sun : {
				on : Converter.type.BOOLEAN,
				dayTime : Converter.type.FLOAT, 
				nightTime : Converter.type.FLOAT,
				switchTime : Converter.type.FLOAT,
				maxOpacity : Converter.type.FLOAT,
				time : Converter.type.FLOAT
			}
		}
	});
	
	var LightUpdateConverter = new Converter.ClassConverter({
		opacity : Converter.type.FLOAT,
		angle : Converter.type.FLOAT, // in radian
		turnedOn : Converter.type.BOOLEAN, // true for on and false of off
		fx : {
			flicker : {
				time : Converter.type.FLOAT
			},
			swinging : {
				deg : Converter.type.FLOAT
			},
			sun : {
				time : Converter.type.FLOAT
			}
		}
	});
	
	function deepCopy( target, o ){
		_.each( o, function( v, k ){
			if( typeof v == 'object') {
				if( target[k] == undefined ) target[k] = {};
				deepCopy( target[k], v );
			}
			else{
				target[k] = v;
			}
		});
	}
	
	
	function Light( option ){
		deepCopy( this,defaults );
		deepCopy( this,option );
		console.log( this );
				
		// calculate recommended rayCount here
		var distance_between_ray = 2; // in pixel
		var tetha = Math.asin( distance_between_ray / 2 / this.maxRange  *2 );
		var rayCount = this.angleWidth / tetha;
		
		_.defaults( this, { rayCount : rayCount });
	}
	
	Light.baseConverter = LightBaseConverter;
	Light.updateConverter = LightUpdateConverter;
	
	_.extend( Light.prototype, {
		getBaseBin : function(){
			return LightBaseConverter.convertToBin( this );
		},
		parseBaseBin : function( bin ){
			_.extend( this, LightBaseConverter.convertToClass( bin ) );
		},
		
		getUpdateBin : function(){
			return LightUpdateConverter.convertToBin( this );
		},
		parseUpdateBin : function( bin ){
			_.extend( this, LightUpdateConverter.convertToClass( bin ));
		},
		parseUpdate : function( obj ){
			deepCopy( this, obj );
		}
	});
	
	_.extend( Light.prototype, {
		turnOn : function(){ this.turnedOn = true ;},
		turnOff : function(){ this.turnedOn = false ;},
		update : function(dt){
			// FX 
			var fx = this.fx;

			if( fx.flicker.on ) this.updateFxFlicker(dt);
			if( fx.swinging.on ) this.updateFxSwing(dt);
			if( fx.sun.on ) this.updateFxSun(dt);
		},
		updateFxFlicker : function(dt){
			var settings = this.fx.flicker;
			var light = this;
			
			settings.time += dt;
			
			settings.time %= settings.flickerDuration + settings.onDuration;
			
			if( settings.time < settings.flickerDuration ){
				if( Math.floor( settings.time / settings.flickerSpeed ) % 2 == 0 ) 
					light.turnOn();
				else 
					light.turnOff();
				
			}
			else { // time < flickerDuration + onDuration
				light.turnOn();

			}
		},
		updateFxSun : function(dt){
			var settings = this.fx.sun;
			var sun = this;
			
			settings.time += dt;
						
			settings.time %= settings.dayTime + settings.switchTime + settings.nightTime + settings.switchTime;
			
			if( settings.time < settings.dayTime ){
				sun.opacity = settings.maxOpacity;
			}
			else if( settings.time < settings.dayTime + settings.switchTime ){
				// relative time
				var rTime = settings.time-settings.dayTime;

				sun.opacity = Math.cos( rTime / settings.switchTime * Math.PI/2 ) * settings.maxOpacity;
			}
			else if( settings.time < settings.dayTime + settings.switchTime + settings.nightTime ){
				sun.opacity = 0;
			}
			else {
				var rTime = settings.time-settings.dayTime-settings.switchTime-settings.nightTime;

				sun.opacity = Math.sin( rTime / settings.switchTime * Math.PI/2 );			
			}
		},
		updateFxSwing : function(dt){
			var settings = this.fx.swinging;
			
			this.angle = settings.angleBase + Math.sin( settings.deg ) * settings.angleDeviation;
			settings.deg += settings.speed*Math.PI*2 * dt;
		}
		
	});
	
	return Light;
	
	
});
