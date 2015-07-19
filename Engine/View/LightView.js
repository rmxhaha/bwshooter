define(['Engine/Game/Light'], function( Light ){
	var renderLight = function( ctx, light ){
		if( !(light instanceof Light ) )
			throw new Error('cannot render class beside Light');
		
		
	}
	
	
	return { render : renderLight };
});
