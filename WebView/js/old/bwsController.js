/********************************
* Revival Version of Black White Shooter project 
* 	Rewriting the code to use backbone MVC
*	All logic will be maintained
*	
* Author 			: rmxhaha 
*********************************/

(function(global){
    var PlayerCommand = Backbone.Model.extend({
       defaults : {
           goRight : false,
           goLeft : false,
           jump : false,
           fall : false,
           shoot : false
       }
    });
    
    var PlayerCommandConverter = new BCConverter([
        { name : 'goRight', type : BCConverter.type.BOOLEAN },
        { name : 'goLeft', type : BCConverter.type.BOOLEAN },
        { name : 'jump', type : BCConverter.type.BOOLEAN },
        { name : 'fall', type : BCConverter.type.BOOLEAN },
        { name : 'shoot', type : BCConverter.type.BOOLEAN }
    ]);
    
    var PlayerController = Backbone.Model.extend({
        defaults : {
            model : null,
            world : null,
            frameId : 0
        },
        initialize : function(){
            this.set('command', new PlayerCommand );
            if( this.model === null ) 
                throw new Error('model may not be null');
            if( this.world === null )
                throw new Error('world may not be null');
            
            // listenTo update trigger from world
        },
        update : function(){
            var dt = this.get('world').timestep();
            
            var cmd = this.get('command');
            
            
            // left and right
            if( cmd.get('goLeft') ){
                player.goLeft();
            }
            else if( cmd.get('goRight')){
                player.goRight();
            }
            
            if( cmd.get('fall')){
                 player.jump();
            } else if( cmd.get('jump') ){
                player.fall();
            }
            
            if( cmd.get('shoot')){
                player.shoot();
            }
        }
    });

    /********************************
	* Remote Player Controller
	* Control Player from server data from other player for multiplayer purpose
	*
	* Example
	
	var Player = new Player( ... );
	var RemoteController = new RemotePlayerController( player );
	RemoteController.update( *dataFromServer* );
	
	* Author 	: rmxhaha 
	* Date  	: 24 May 2015
	*********************************/
    
    var RemotePlayerController = PlayerController.extend({
        parseCommand : function( compressedCommand ){
            var newCommand = PlayerCommandConverter.convertToClass( compressedCommand );
            this.set('command', newCommand );
        }
    });

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


	
	
	global.KeyboardPlayerController = KeyboardPlayerController;
	global.RemotePlayerController = RemotePlayerController;
	
})( this );

