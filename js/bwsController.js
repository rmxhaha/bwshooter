/********************************
* Revival Version of Black White Shooter project 
* 	Rewriting the code to use backbone MVC
*	All logic will be maintained
*	
* Author 			: rmxhaha 
*********************************/

(function(global){
	/********************************
	* KeyboardPlayerController
	* Control Player By Keyboard using this class
	*
	* Example
	
	var Player = new Player( ... );
	var KeyController = new KeyboardPlayerController( player );
	
	* Author 	: rmxhaha 
	* Date  	: 24 May 2015
	*********************************/
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


	/********************************
	* KeyboardPlayerController
	* Control Player from server data from other player for multiplayer purpose
	*
	* Example
	
	var Player = new Player( ... );
	var RemoteController = new RemotePlayerController( player );
	RemoteController.update( *dataFromServer* );
	
	* Author 	: rmxhaha 
	* Date  	: 24 May 2015
	*********************************/
	var RemotePlayerController = (function(){
		var RemotePlayerController = function( player ){
			this.model = player;
			this.lastCommandTime = new Date();
			this.init();
		}
		
		RemotePlayerController.prototype.init = function(){
			var player = this.model;
		}
		
		RemotePlayerController.prototype.update = function( logs ){
			for( var i = 0; i < logs.length; ++ i ){
				var cmd = logs[i];
				
				if( cmd[0] == 'm' )
			}
		}
		
		return RemotePlayerController;
	})();
	
	
	global.KeyboardPlayerController = KeyboardPlayerController;
	global.RemotePlayerController = RemotePlayerController;
	
})( this );

