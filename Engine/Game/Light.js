define(['Engine/Utility/underscore'], function( _ ){
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
				flickerSpeed : 0.2,
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
	
	function Light( option ){
		_.extend( this, defaults );
		_.extend( this, option );
		
		// calculate recommended rayCount here
		var distance_between_ray = 2; // in pixel
		var tetha = Math.asin( distance_between_ray / 2 / this.maxRange );
		var rayCount = this.angleWidth / 2 / tetha;
		
		_.defaults( this, { rayCount : rayCount });
	}
	
	_.extend( Light.prototype, {
		turnOn : function(){ this.turnedOn = true ;},
		turnOff : function(){ this.turnedOn = false ;},
		update : function(dt){
			// FX 
			var fx = this.fx;
			
			if( fx.flicker.on ) updateFxFlicker(dt);
			if( fx.swinging.on ) updateFxSwing(dt);
			if( fx.sun.on ) updateFxSun(dt);
		},
		updateFxFlicker : function(dt){
			var settings = this.fx.flicker;
			
			settings.time += dt;
			
			this.time %= settings.flickerDuration + settings.onDuration;
			
			if( this.time < settings.flickerDuration ){
				if( Math.floor( this.time / settings.flickerSpeed ) % 2 == 0 ) 
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
			
			this.direction = settings.angleBase + Math.sin( settings.deg ) * settings.angleDeviation;
			settings.deg += settings.speed*Math.PI*2 * dt;
		}
		
	});
	
	
});
