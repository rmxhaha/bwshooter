var KeyboardPlayerController = (function(){
	var KeyboardPlayerController = function( Player ){
		this.model = player;
		this.keyDownPressed = false;
		this.init();
	}
	
	KeyboardPlayerController.prototype.init = function()
	{
		var player = this.model;
		var that = this;
		
		window.addEventListener("keydown", function(event){
			switch( event.keyCode ){
			case 16:
				if( player.isWalking() ) player.sprint();
				break;
			case 17: // ctrl
			case 88: // X
				player.shoot();
				break;
			case 37: // left
				player.goLeft();
				break;
			case 39: // right
				player.goRight();
				break;
			case 38: // up
			case 32: // spacebar
			case 67: // C
				if( !that.keyDownPressed ){
					player.jump();
				}
				else {
					player.fall();
				}
				break;
			case 40: // down
				that.keyDownPressed = true;
				break;
			}
		});

		window.addEventListener("keyup", function(event){
			switch( event.keyCode ){
			case 37: // left
			case 39: // right
				player.standStill();
				break;
			case 16:
				if( player.isSprinting() ) player.walk();
			case 40:
				that.keyDownPressed = false;
			}
		});
		
	}
	
	return KeyboardPlayerController;
})();
