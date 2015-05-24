(function(global){
	var IntToBin = function( num ){
		var q = 256;
		var limit = 32; // below 32 then it's not converting into 1 character 
		var range = q - limit;

		return String.fromCharCode(
			limit + num % range,
			limit + (num / range) % range,
			limit + (num / range / range) % range,
			limit + (num / range / range / range) % range
		);
	}

	var BinToInt = function( binarr, s ){
		if( typeof s !== 'number' ) 
			s = 0;
		
		var q = 256;
		var limit = 32;  
		var range = q - limit;

		var number = 
			(binarr[s+0].charCodeAt(0) - limit) + 
			(binarr[s+1].charCodeAt(0) - limit) * range +
			(binarr[s+2].charCodeAt(0) - limit) * range * range +
			(binarr[s+3].charCodeAt(0) - limit) * range * range * range;

		return number;
	}
	
	global.BinToInt = BinToInt;
	global.IntToBin = IntToBin;

	/**
	
	Test Code 

	for( var i = 2000000; i--; ){
		var pick = Math.floor( Math.random() * 224 * 224 * 224 * 224 );
		if( BinToInt( IntToBin( pick )) !== pick ){
			console.log( pick );
		}
	}

	*/
})( this );


