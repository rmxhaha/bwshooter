define([], function(){
	var defaults = {
		left : false,
		right : false,
		jump : false,
		sprint : false,
		shoot : false
	};
	
	var KeyAction = function( opt ){
		_.extend( this, defaults );
		_.extend( opt );
	}
	
	return KeyAction;
});
