define(['Engine/Utility/Converter'], function( Converter ){
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
	
	var converter = new Converter.ClassConverter({
		left : Converter.type.BOOLEAN,
		right : Converter.type.BOOLEAN,
		jump : Converter.type.BOOLEAN,
		sprint : Converter.type.BOOLEAN,
		shoot : Converter.type.BOOLEAN,
		fall : Converter.type.BOOLEAN
	});
	
	converter.size = converter.convertToBin( new KeyAction() ).length; // please change this accordingly
	
	KeyAction.converter = converter
	
	KeyAction.prototype = {
		getBin : function(){
			return converter.convertToBin( this );
		},
		parseBin : function( bin ){
			_.extend( this, converter.convertToClass( bin ) );
		}
	}
	
	return KeyAction;
});
