define([], function(){
	var defaults = {
		left : false,
		right : false,
		jump : false,
		sprint : false,
		shoot : false
	};
	
	var KeyAction = function(){
		_.extend( this, defaults );
	}
});
