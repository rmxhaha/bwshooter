var requirejs = require('requirejs');
requirejs(['Converter'], function( Converter ){
	var cvt = new Converter.BCConverter([
		{ name : 'smt', type : Converter.BCConverter.type.NUMBER }
	]);
	var acvt = new Converter.BCArrayConverter( cvt, true );
	
	console.log( acvt.convertToArray( acvt.convertToBin( [{smt : 2},{ smt : 5}] ) ));
	
});
