/********************************
* Revival Version of Black White Shooter project 
* 	Rewriting the code to use backbone MVC
*	All logic will be maintained
*	
* Author : rmxhaha 
* Date   : 19 May 2015
*********************************/

(function(global){
	Backbone.$ = function( element ){
		return element.getContext('2d');
	};

	var PlayerCircularReloadBar = Backbone.View.extend({
		defaults : {
			outerWidth : 100,
			innerWidth : 90,
			color : "yellow",
			opacity : 0.5
		},
		tagName : 'canvas',
		initialize : function(){
			this.options = _.extend({}, this.defaults, this.options);
		},
		
		render : function(){
			// canvas 
			var ctx = this.$el;

			var x = this.model.get('x');
			var y = this.model.get('y');
			var startAngle = 0;
			var endAngle = this.model.getTimeLeftToFinishReload() / this.model.getReloadTime();
			
			var outerWidth = this.get('outerWidth');
			var innerWidth = this.get('innerWidth');
			var color = this.get('color');
			var opacity = this.get('opacity');
			
			ctx.save();

			ctx.fillStyle = color;
			ctx.globalAlpha = opacity;

			ctx.beginPath();
			ctx.arc( x, -y, outerWidth, startAngle, endAngle, true );
			ctx.arc( x, -y, innerWidth, endAngle, startAngle, false );
			ctx.closePath();

			ctx.fill();
			ctx.restore();
		}
	});
	
	var PlayerView = Backbone.View.extend({
		defaults : {
			main : false
		},
		tagName : 'canvas',
		initialize : function(){
			this.options = _.extend({}, this.defaults, this.options);
		},
		render : function()
		{
			var ctx = this.$el;
			
			ctx.save();

			// drawing hero manually 
			
			switch( this.model.get('type') ){
			case 0:
				ctx.fillStyle = "black";
				break;
			case 1:
				ctx.fillStyle = "white";
				break;
			case 2:
				var duration = this.model.hasBeenDeadFor();

				if( duration < this.model.get('rotDuration') - this.model.get('fadeOutDuration') ){
					ctx.fillStyle = "red";
					ctx.globalAlpha = 1;
				}
				else if( duration < this.model.get('rotDuration') ){
					ctx.fillStyle = "red";
					ctx.globalAlpha = 1 - (duration - this.model.get('rotDuration') + this.model.get('fadeOutDuration')) / this.model.get('fadeOutDuration');
				}
				else {
					ctx.globalAlpha = 0;
				}
			}

			if( !this.model.isDead() && this.get('main') ){
				// apply highlighting
				ctx.strokeStyle = ( this.model.get('type') == 0 ? "white" : "black" );
				ctx.lineWidth = 3;
			}
			
			var applyToScreen;
			if( this.get('main') ){
				applyToScreen = function(){
					ctx.fill();
					
					ctx.save();
					ctx.globalAlpha = 0.2;
					ctx.stroke();
					ctx.restore();
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
			
			
		}
	});
	

	global.PlayerCircularReloadBar = PlayerCircularReloadBar;
	global.PlayerView = PlayerView;
})( this );
