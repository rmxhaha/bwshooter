define(['Engine/Game/Player','Engine/Utility/underscore'],function( Player, _ ){
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
		
		_.extend( this, _default );
		_.extend( this, option );
	}
	

	CircularBarUI.prototype = {
		/**
		 *  Apply new property to the class in bulk
		 */
		set : function(opt){
			_.extend( this, opt );
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

	var reloadBarUI = new CircularBarUI;
	
	function renderReloadBar( ctx, player ){
		if( !player.isReloading() ) return;

		var d = new Date() - player.lastShoot;
		var frac = d / (player.reloadSpeed*1000);
		var endAngle = -Math.PI / 4;
		
		reloadBarUI.set({
			x : player.x + player.width/2,
			y : player.y - player.height/2,
			startAngle : frac * Math.PI*2 + endAngle,
			endAngle : endAngle
		});
		
		reloadBarUI.draw(ctx);
	}
	
	function renderPlayer( ctx, player, main ){
		// input checks
		if( !(player instanceof Player))
			throw new Error('model is not Player class');

		if( main == undefined )
			main = false;
		else
			main = !! main;
		
		// begin render
		ctx.save();
		
		
		
		// prepare draw function
		var applyToScreen;
		if( main ){
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

		// adjust player colour based on status 
		adjustPlayerColor.bind( player )(ctx,main);

		// move pointer to player coordinate
		ctx.translate( Math.floor( player.x ), -Math.floor( player.y ) );
		
		drawPlayerPath.bind( player )(ctx);
		applyToScreen();

		drawGunPath.bind( player )(ctx);
		applyToScreen();
		
		ctx.restore();
		//end render
		
		if( main ) renderReloadBar( ctx, player );
	}
	
	function drawPlayerPath(ctx) {
		ctx.beginPath();

		// draw head
		ctx.beginPath();
		ctx.arc( 45, 50,50,Math.PI*116.5/180,2.353*Math.PI);

		// draw body
		ctx.lineTo( this.width, this.height );			
		ctx.lineTo( 0, this.height );
		ctx.closePath();
	}
	
	function drawGunPath(ctx){
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
		
	}
	
	function adjustPlayerColor(ctx, main){
		if( this.isDead ){
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
		else {

			switch( this.team ){
			case 0:
				ctx.fillStyle = "black";
				break;
			case 1:
				ctx.fillStyle = "white";
				break;
			}

			if( main ){
				// apply highlighting
				ctx.strokeStyle = ( this.type == 0 ? "white" : "black" );
				ctx.lineWidth = 3;
			}
		}
	}
	
	
	
	return { render : renderPlayer, renderReloadBar : renderReloadBar };
});
