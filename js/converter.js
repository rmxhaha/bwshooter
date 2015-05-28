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
	
	Test Code for bin to int

	for( var i = 2000000; i--; ){
		var pick = Math.floor( Math.random() * 224 * 224 * 224 * 224 );
		if( BinToInt( IntToBin( pick )) !== pick ){
			console.log( pick );
		}
	}

	*/

	var CharToBool7 = function( c ){
		var arr = [];
		arr.length = 7;

		c = c.charCodeAt(0) - 32;
		for( var i = 0; i < 7; ++ i ){
			arr[i] = (c >> i) & 1;
		}
		
		return arr;
	}
	
	var Bool7ToChar = function( arr ){
		var L = Math.min( arr.length, 7 );
		var bin = 0;
		
		for( var i = 0; i < L; ++ i ){
			var b = arr[i];
			bin += b << i;
		}
		
		return String.fromCharCode( bin + 32 );
	}
	
	/**
		Test char to 7 boolean
		
		console.log(
			CharToBool7(
				Bool7ToChar( [true, true, true, true, true, false, true] )
			)
		);
	*/
	
	function copy( arr ){
		if( typeof arr !== 'object' ) return arr;
		var all = ( arr instanceof Array ? [] : {});
		for( var i in arr ){
			all[i] = copy( arr[i] );
		}
		
		return all;
	}

	// binary <-> class converter
	var BCConverter = (function(){
		var BCConverter = function( dataOrder ){
			var corder = copy( dataOrder ); 

			var getName = function(y){ return y.name };
			
			this.boolArr = corder.filter(function(x){ return x.type == BCConverter.type.BOOLEAN }).map(getName).sort();
			this.numArr = corder.filter(function(x){ return x.type == BCConverter.type.NUMBER }).map(getName).sort();
			this.strArr = corder.filter(function(x){ return x.type == BCConverter.type.STRING }).map(getName).sort();

			/**
				Example : 
				[
					{ name : 'str', type : enum type },
					{ name : 'str2', type : enum type }
				]
			*/
		}

		BCConverter.type = {
			NUMBER : 0,
			STRING : 1,
			BOOLEAN : 2
		};
		
		BCConverter.prototype.convertToBin = function( obj ){
			if( typeof obj !== 'object' ) return false;
			
			function checkType( paramNames, obj, type ){
				for( var i = 0; i < paramNames.length; ++ i ){
					var name = paramNames[i];
					if( typeof obj[ name ] !== type ){
						throw new Error('parameter ' + name + ' is not a ' + type + ' as stated');
					}
				}
			}
			
			// check if all the names that will be copied is with the right type
			checkType( this.boolArr, obj, 'boolean' );
			checkType( this.strArr, obj, 'string' );
			checkType( this.numArr, obj, 'number' );
			
			/**
				write order 
				1. boolean
				2. number 
				3. string
			*/
			
			var binOut = "";
			
			// boolean
			var p = 0;
			var i = 0;
			while( p < this.boolArr.length ){
				var arr = [];

				var k = 0;
				for( ; k < 7 && p < this.boolArr.length; ++ k, ++ p )
				{
					arr[k] = obj[ this.boolArr[i*7+k] ]
				}
				// to fill excess bool7 space with false
				for( ; k < 7; ++ k ){
					arr[k] = false;
				}
				
				++ i;
				binOut += Bool7ToChar( arr );
			}
			
			// integer 
			for( var i = 0; i < this.numArr.length; ++ i ){
				var num = obj[ this.numArr[i] ];
				binOut += IntToBin( num );
			}
			
			// string
			for( var i = 0; i < this.strArr.length; ++ i ){
				var str = obj[ this.strArr[i] ];
				binOut += IntToBin( str.length );
				binOut += str;
			}
			
			
			return binOut;
		}
		
		BCConverter.prototype.convertToClass = function( bin ){
			if( typeof bin !== 'string' ) 
				throw new Error('binary data is not in the form of string');

			var obj = {};
			
			var ptr = 0;
			
			var n = Math.ceil( this.boolArr.length / 7 );

			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}

			var p = 0;
			for( var c = 0; c < n; ++ c )
			{
				var arr = CharToBool7( bin[ptr ++ ] );
				for( var i = 0; p < this.boolArr.length && i < 7; ++ p, ++i )
				{
					var name = this.boolArr[p];
					obj[name] = arr[i];
				}
			}
			
			var n = this.numArr.length * 4;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.numArr.length; ++ i ){
				var name = this.numArr[i];
				obj[name] = BinToInt( bin, ptr );
				ptr += 4;
			}
			
			
			// error message not coded yet
			for( var i = 0; i < this.strArr.length; ++ i ){				
				var name = this.strArr[i];
				var length = BinToInt( bin, ptr );
				ptr += 4;

				obj[name] = bin.substr( ptr, length );
				ptr += length;
			}
			
			return obj;
		}

		/**
		Boolean test

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
			CharToBool7(cvt.convertToBin(
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
			)[1] )
		);
		*/
		
		/**
		//Integer Test
		var cvt = new BCConverter([
			{ name : 'a', type : BCConverter.type.NUMBER },
			{ name : 'b', type : BCConverter.type.NUMBER }
		]);
		
		console.log( 
			BinToInt( 
				cvt.convertToBin(
					{a : 32320, b : 434093 }
				), 4
			)
		);
		*/
		
		/**
		//string test
		var cvt = new BCConverter([
			{name : 'a', type : BCConverter.type.STRING },
			{name : 'b', type : BCConverter.type.STRING }
		]);
		
		
		console.log(
			cvt.convertToBin({
				a : 'asdfg',
				b : 'fsda'
			})[4]
		);
		*/
		
		
		var cvt = new BCConverter([
			{ name : 'name', type : BCConverter.type.STRING },
			{ name : 'age', type : BCConverter.type.NUMBER },
			{ name : 'ismarried', type :BCConverter.type.BOOLEAN },
			{ name : 'lol', type : BCConverter.type.STRING }
		]);
		
		console.log( 
			cvt.convertToClass(
			cvt.convertToBin(
				{ name : 'Rmxhaha', age : 21, ismarried : false, lol : 'boset' }
			)
			)
		);
		console.log(
			cvt.convertToBin(
				{ name : 'Rmxhaha', age : 21, ismarried : false, lol : 'boset' }
			).length
		);
			
		
		return BCConverter;
	})();
	
})( this );


