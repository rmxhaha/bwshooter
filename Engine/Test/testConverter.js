var requirejs = require('requirejs');
requirejs.config({
	baseUrl : 'E:/Labs/bwshooter'
});

requirejs(['Engine/Utility/Converter'], function( Converter ){
	/**
	//Test Code for bin to int

	for( var i = 2000000; i--; ){
		var pick = Math.floor( Math.random() * 224 * 224 * 224 * 224 * 224 - 224 * 224 * 224 * 224 * 224/2 );
		if( Converter.BinToInt( Converter.IntToBin( pick )) !== pick ){
			console.log( pick );
		}
	}
	
	console.log('R');
	*/

	/**
		//Test char to 8 boolean
		
		console.log(
			Converter.CharToBool8(
				Converter.Bool8ToChar( [false, true, true, true, true, false, true, false] )
			)
		);
	*/
	
	/**
	//Boolean test

	var cvt = new BCConverter([
		{name : 'a', type : BCConverter.type.BOOLEAN },
		{name : 'b', type : BCConverter.type.BOOLEAN },
		{name : 'c', type : BCConverter.type.BOOLEAN },
		{name : 'd', type : BCConverter.type.BOOLEAN },
		{name : 'e', type : BCConverter.type.BOOLEAN },
		{name : 'f', type : BCConverter.type.BOOLEAN },
		{name : 'g', type : BCConverter.type.BOOLEAN },
		{name : 'h', type : BCConverter.type.BOOLEAN },
		{name : 'i', type : BCConverter.type.BOOLEAN },
		{name : 'j', type : BCConverter.type.BOOLEAN }
	]);
	
	console.log( 
		cvt.convertToClass(
			cvt.convertToBin(
				{
					a : false,
					b : true,
					c : true,
					d : true,
					e : false,
					f : true,
					g : true,
					h : true,
					i : true,
					j : true
				}
			)
		)
	);
	*/
	
	//Integer Test
	/*
	var cvt = new Converter.BCConverter({ 
		a : Converter.type.NUMBER,
		b : Converter.type.NUMBER
	}, false);
	
	console.log( 
		Converter.BinToInt( 
			cvt.convertToBin(
				{a : 32320, b : 434093 }
			), 4
		)
	);
	*/

	// short test
	var cvt = new Converter.BCConverter([
		{ name : 'a', type : Converter.type.SHORT },
		{ name : 'b', type : Converter.type.SHORT }
	], false);
	
	console.log( 
		cvt.convertToClass( 
			cvt.convertToBin(
				{a : 432, b : 33000 }
			)
		)
	);

	
	
	/**
	//string test
	var cvt = new BCConverter([
		{name : 'a', type : BCConverter.type.NSTRING },
		{name : 'b', type : BCConverter.type.NSTRING }
	]);
	
	
	console.log(
			cvt.convertToBin({
				a : 'asdfg',
				b : 'fsda'
			}).length
	);
	*/
	
	


});
