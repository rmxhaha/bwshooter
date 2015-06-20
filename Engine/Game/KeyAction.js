define([], function(){
	var defaults = {
		left : false,
		right : false,
		jump : false,
		sprint : false,
		shoot : false,
		fall : false
	};
	
	var KeyAction = function( opt ){
		_.extend( this, defaults );
		_.extend( this, opt );
	}
	
	return KeyAction;
});
