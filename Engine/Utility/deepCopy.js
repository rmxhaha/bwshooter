define([], function(){
	function deepCopy( target, o ){
		_.each( o, function( v, k ){
			if( typeof v == 'object') {
				if( target[k] == undefined ) target[k] = {};
				deepCopy( target[k], v );
			}
			else{
				target[k] = v;
			}
		});
	}
	
	return deepCopy;
});
