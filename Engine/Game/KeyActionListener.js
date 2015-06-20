define(['Engine/Game/KeyAction','Engine/Utility/underscore'], function( KeyAction, Player, _ ){

	var KeyActionListener = function(){
		this.isKeyDown = [];
		
		this.init();
	}
	
	KeyActionListener.prototype = {
		init : function(){
			for( var i = 0; i < 256; ++ i ) 
				this.isKeyDown[i] = false;

			window.addEventListener('keydown', this.onkeydown.bind(this));
			window.addEventListener('keyup', this.onkeyup.bind(this));
		},
		
		onkeydown : function(event){
			this.isKeyDown[ event.keyCode ] = true;
		},
		onkeyup : function(event){
			this.isKeyDown[ event.keyCode ] = false;			
		},
		getKeyAction : function(){
			var keyAction = new KeyAction;
			
			var keyDown = this.isKeyDown
			
			keyAction.left = keyDown[37]; // left arrow
			keyAction.right = keyDown[39]; // right arrow
			keyAction.shoot = keyDown[17] || keyDown[88]; // ctrl, X
			keyAction.sprint = keyDown[16]; // shift
			
			var jumpKeyPressed = keyDown[32] || keyDown[67]; // spacebar, C
			
			if( keyDown[40] ){ // arrow down
				keyAction.jump = false;				
				keyAction.fall = jumpKeyPressed;
			}
			else{
				keyAction.jump = jumpKeyPressed;
				keyAction.fall = false;
			}
			
			return keyAction;
		}
	}
	
	return KeyActionListener
});
