define(['Engine/utility/lz-string'], function(LZString){
	
	var Converter = {};
	
	Converter.type = Object.freeze({
		NUMBER : 0,
		INTEGER : 0,
		INT32 : 0,
		INT16 : 4,
		SHORT : 4,

		STRING : 1, // the default
		PASCAL_STRING : 1, // 32 bit pascal string
		NULL_TERMINATED_STRING : 3, // null terminated string
		PSTRING : 1, // shortened version
		NSTRING : 3, // shortened version

		BOOLEAN : 2
	});
	
	var IntToBin = function( num ){
		var range = 256;

		return String.fromCharCode(
			num & 0xff,
			(num >> 8) & 0xff,
			(num >> 16) & 0xff,
			(num >> 24) & 0xff
		);
	}

	var BinToInt = function( binarr, s ){
		var number = 
			(binarr[s+0].charCodeAt(0) << 0)+
			(binarr[s+1].charCodeAt(0) << 8)+
			(binarr[s+2].charCodeAt(0) << 16)+
			(binarr[s+3].charCodeAt(0) << 24)
	
		return number;
	}
	
	Converter.BinToInt = BinToInt;
	Converter.IntToBin = IntToBin;
	
	var ShortToBin = function( num ){
		return String.fromCharCode(
			num & 0xff,
			(num >> 8) & 0xff
		);
	}

	var BinToShort = function( binarr, s ){
		var number = 
			(binarr[s+0].charCodeAt(0) << 0)+
			(binarr[s+1].charCodeAt(0) << 8);
	
		return number;
	}
	
	Converter.ShortToBin = ShortToBin;
	Converter.BinToShort = BinToShort;
	
	var CharToBool8 = function( c ){
		var arr = [];
		arr.length = 8;

		c = c.charCodeAt(0);
		for( var i = 0; i < 8; ++ i ){
			arr[i] = !!((c >> i) & 1);
		}
		
		return arr;
	}
	
	var Bool8ToChar = function( arr ){
		var L = Math.min( arr.length, 8 );
		var bin = 0;
		
		for( var i = 0; i < L; ++ i ){
			var b = arr[i];
			bin += b << i;
		}
		
		return String.fromCharCode( bin );
	}
	
	
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
		var BCConverter = function( dataOrder, compress ){
			var corder = copy( dataOrder ); 

			var getName = function(y){ return y.name };
			
			this.boolArr 	= corder.filter(function(x){ return x.type == BCConverter.type.BOOLEAN }).map(getName).sort();
			this.numArr 	= corder.filter(function(x){ return x.type == BCConverter.type.NUMBER }).map(getName).sort();
			this.shortArr 	= corder.filter(function(x){ return x.type == BCConverter.type.SHORT }).map(getName).sort();
			this.pstrArr 	= corder.filter(function(x){ return x.type == BCConverter.type.PASCAL_STRING }).map(getName).sort();
			this.nstrArr 	= corder.filter(function(x){ return x.type == BCConverter.type.NULL_TERMINATED_STRING }).map(getName).sort();

			this.compress 	= ( typeof compress ==='undefined' ? true : !!compress );
			
			/**
				Example : 
				[
					{ name : 'str', type : enum type },
					{ name : 'str2', type : enum type }
				]
			*/
		}

		BCConverter.type = Converter.type;
		
		BCConverter.prototype.convertToBin = function( obj ){
			if( typeof obj !== 'object' ) return false;

			function get( obj, index ){
				return obj[ index ];
			}
			
			function checkType( paramNames, obj, type ){
				for( var i = 0; i < paramNames.length; ++ i ){
					var name = paramNames[i];
					if( typeof get( obj, name ) !== type ){
						throw new Error('parameter ' + name + ' is not a ' + type + ' as stated');
					}
				}
			}

			// check if all the names that will be copied is with the right type
			// boolean need no check
			checkType( this.numArr, obj, 'number' );
			checkType( this.shortArr, obj, 'number' );
			checkType( this.pstrArr, obj, 'string' );
			checkType( this.nstrArr, obj, 'string' );
			
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
				for( ; k < 8 && p < this.boolArr.length; ++ k, ++ p )
				{
					arr[k] = !!get( obj, this.boolArr[i*8+k] );
				}
				// to fill excess bool8 space with false
				for( ; k < 8; ++ k ){
					arr[k] = false;
				}
				
				++ i;
				binOut += Bool8ToChar( arr );
			}
			
			// integer 
			for( var i = 0; i < this.numArr.length; ++ i ){
				var num = get( obj, this.numArr[i] );
				binOut += IntToBin( num );
			}
			
			// short
			for( var i = 0; i < this.shortArr.length; ++ i ){
				var num = get( obj, this.shortArr[i] );
				binOut += ShortToBin( num );
			}
			
			// pascal string 32
			for( var i = 0; i < this.pstrArr.length; ++ i ){
				var str = get( obj, this.pstrArr[i] );
				binOut += IntToBin( str.length );
				binOut += str;
			}
			
			// null terminated string 
			for( var i = 0; i < this.nstrArr.length; ++ i ){
				var str = get( obj, this.nstrArr[i] );
				binOut += str;
				binOut += '\0';
			}

			if( this.compress )
				return LZString.compress( binOut );
			else
				return binOut;
		}
		
		BCConverter.prototype.convertToClass = function( bin ){
			if( typeof bin !== 'string' ) 
				throw new Error('binary data is not in the form of string');
			
			if( this.compress ) 
				bin = LZString.decompress( bin );
			
			var obj = {};
			
			var ptr = 0;
			
			// boolean
			var n = Math.ceil( this.boolArr.length / 8 );

			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}

			var p = 0;
			for( var c = 0; c < n; ++ c )
			{
				var arr = CharToBool8( bin[ptr ++ ] );
				for( var i = 0; p < this.boolArr.length && i < 8; ++ p, ++i )
				{
					var name = this.boolArr[p];
					obj[name] = arr[i];
				}
			}
			
			// number
			var n = this.numArr.length * 4;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.numArr.length; ++ i ){
				var name = this.numArr[i];
				obj[name] = BinToInt( bin, ptr );
				ptr += 4;
			}

			// short
			var n = this.shortArr.length * 2;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.shortArr.length; ++ i ){
				var name = this.shortArr[i];
				obj[name] = BinToShort( bin, ptr );
				ptr += 2;
			}
			
			
			// error message not coded yet
			// pascal string
			for( var i = 0; i < this.pstrArr.length; ++ i ){				
				var name = this.pstrArr[i];
				var length = BinToInt( bin, ptr );
				ptr += 4;

				obj[name] = bin.substr( ptr, length );
				ptr += length;
			}
			
			// null terminated string
			for( var i = 0; i < this.nstrArr.length; ++ i ){
				var name = this.nstrArr[i];
				var str = "";
				while( bin[ptr] != '\0' ){
					str += bin[ptr];
					++ ptr;
				}
				obj[name] = str;
				++ ptr;
			}
			
			return obj;
		}

		return BCConverter;
	})();


	
	
	
	Converter.CharToBool8 = CharToBool8;
	Converter.Bool8ToChar = Bool8ToChar;
	Converter.BCConverter = BCConverter;
	
	var BCArrayConverter = (function(){
		var BCArrayConverter = function( baseConverter, compress ){
			// force not to compress data b/c compressing data twice give no benefit
			baseConverter.compress = false;
			
			this.baseConverter = baseConverter;
			this.compress 	= ( typeof compress ==='undefined' ? true : !!compress );
		}
		
		BCArrayConverter.prototype.convertToArray = function( bin ){
			if( this.compress )
				bin = LZString.decompress( bin );
			
			var arr = [];
			var ptr = 0;
			var i = 0;
			while( ptr < bin.length ){				
				var length = BinToShort( bin, ptr );
				ptr += 2;

				arr[i++] = this.baseConverter.convertToClass( bin.substr( ptr, length ) );
				ptr += length;
			}
			
			return arr;
		}
		
		BCArrayConverter.prototype.convertToBin = function( array ){
			var binOut = "";

			for( var i = 0; i < array.length; ++ i ){
				var str = this.baseConverter.convertToBin( array[i] );
				if( str.length > 256 * 128 - 1 )
					throw new Error('member of array is to big');
				binOut += ShortToBin( str.length );
				binOut += str;
			}
			
			if( this.compress ){
				return LZString.compress( binOut );
			}
			else {
				return binOut;
			}
		}
		
		
		return BCArrayConverter;
	})();
	
	Converter.BCArrayConverter = BCArrayConverter;
	
	/**
		New Class schema
		
		{
			columnName1 : 'integer',
			columnName2 : 'int',
			columnName3 : 'int32',
			columnName3 : 'number',
			columnName4 : 'boolean',
			columnName5 : 'bool'
			columnName6 : {
				columnName1 : Converter.type.INTEGER,
				
			}
		}
	*/
	
	return Converter;
});