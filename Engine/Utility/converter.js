
define(['Engine/Utility/lz-string','Engine/Utility/underscore','Engine/Utility/bops'], function(LZString,_, bops){

	var Converter = {};
	
	Converter.type = Object.freeze({
		NUMBER : 0,
		INTEGER : 0,
		INT32 : 0,
		INT16 : 4,
		
		FLOAT : 5,
		DOUBLE : 6,
		
		SHORT : 4,

		STRING : 1, // the default
		PASCAL_STRING : 1, // 32 bit pascal string
		NULL_TERMINATED_STRING : 3, // null terminated string
		PSTRING : 1, // shortened version
		NSTRING : 3, // shortened version

		BOOLEAN : 2
	});
	
	
	var FloatToBin = function( num ){
		var b = new bops(4);
		
	}
	
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
		num += 32767;
		
		return String.fromCharCode(
			num & 0xff,
			(num >> 8) & 0xff
		);
	}

	var BinToShort = function( binarr, s ){
		var number = 
			(binarr[s+0].charCodeAt(0) << 0)+
			(binarr[s+1].charCodeAt(0) << 8);
	
		return number - 32767;
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
	
	var FloatToBin = function( f ){
		var buf = new Uint8Array(4);
		bops.writeFloatLE( buf, f, 0 );
		
		return String.fromCharCode.apply( null, buf );
	}
	
	var BinToFloat = function( bin, ptr ){
		var buf = new Uint8Array(4);
		for( var i = 0; i < 4; ++ i ){
			buf[i] = bin[ ptr + i ].charCodeAt(0);
		}
				
		return bops.readFloatLE( buf, 0 );
	}
	
	Converter.FloatToBin = FloatToBin;
	Converter.BinToFloat = BinToFloat;
	
	var DoubleToBin = function( f ){
		var buf = new Uint8Array(8);
		bops.writeDoubleLE( buf, f, 0 );
		
		return String.fromCharCode.apply( null, buf );
	}
	
	var BinToDouble = function( bin, ptr ){
		var buf = new Uint8Array(8);
		for( var i = 0; i < 8; ++ i ){
			buf[i] = bin[ ptr + i ].charCodeAt(0);
		}
				
		return bops.readDoubleLE( buf, 0 );
	}
	
	Converter.DoubleToBin = DoubleToBin;
	Converter.BinToDouble = BinToDouble;
	
	
	var Bool8ToChar = function( arr ){
		var L = Math.min( arr.length, 8 );
		var bin = 0;
		
		for( var i = 0; i < L; ++ i ){
			var b = arr[i];
			bin += b << i;
		}
		
		return String.fromCharCode( bin );
	}
	
	Converter.CharToBool8 = CharToBool8;
	Converter.Bool8ToChar = Bool8ToChar;
	
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
			if( dataOrder instanceof Array ){
				// deprecated
				var corder = copy( dataOrder ); 

				var getName = function(y){ return y.name };
				
				this.boolArr 	= corder.filter(function(x){ return x.type == BCConverter.type.BOOLEAN }).map(getName).sort();
				this.numArr 	= corder.filter(function(x){ return x.type == BCConverter.type.NUMBER }).map(getName).sort();
				this.shortArr 	= corder.filter(function(x){ return x.type == BCConverter.type.SHORT }).map(getName).sort();
				this.pstrArr 	= corder.filter(function(x){ return x.type == BCConverter.type.PASCAL_STRING }).map(getName).sort();
				this.nstrArr 	= corder.filter(function(x){ return x.type == BCConverter.type.NULL_TERMINATED_STRING }).map(getName).sort();
				this.floatArr 	= corder.filter(function(x){ return x.type == BCConverter.type.FLOAT }).map(getName).sort();
				this.doubleArr 	= corder.filter(function(x){ return x.type == BCConverter.type.DOUBLE }).map(getName).sort();
			}
			else if( typeof dataOrder == 'object' ){
				// new schema 
				var corder = copy( dataOrder ); 
				
				this.numArr = [];
				this.boolArr = [];
				this.shortArr = [];
				this.pstrArr = [];
				this.nstrArr = [];
				this.floatArr = [];
				this.doubleArr = [];
					
				function iterator( key, value ){
					if( value == Converter.type.BOOLEAN )
						this.boolArr.push( key );
					else if( value == Converter.type.NUMBER )
						this.numArr.push( key );
					else if( value == Converter.type.SHORT )
						this.shortArr.push( key );
					else if( value == Converter.type.PASCAL_STRING )
						this.pstrArr.push( key );
					else if( value == Converter.type.NULL_TERMINATED_STRING )
						this.nstrArr.push( key );
					else if( value == Converter.type.FLOAT )
						this.floatArr.push( key );
					else if( value == Converter.type.DOUBLE )
						this.doubleArr.push( key );
				}
				
				function tree( o, parentKey, fn ){

					_.each( _.pairs( o ), function( p ){
						var key = ( parentKey == '' ? 
								p[0] :
								parentKey + '.' + p[0]
							);
						var value = p[1];
						
						if( typeof value == 'object' ){
							tree( value, key, fn );
						}
						else {
							fn( key, value );
						}
					});
				}
				
				tree( corder, '', iterator.bind(this) );

				this.boolArr.sort();
				this.numArr.sort();
				this.shortArr.sort();
				this.pstrArr.sort();
				this.nstrArr.sort();
				this.doubleArr.sort();
				this.floatArr.sort();

			}
			else {
				throw new Error('data schema is unexpected');
			}

			function buildMap( o ){

				return _.chain( _.pairs(o) )
					.filter(function(v){ return typeof v[1] == 'object'; })
					.map(function(p){ return [ p[0], buildMap(p[1]) ]; })
					.object()
					.value()
			}
			
			this.baseMap = buildMap( corder );

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
			if( typeof obj !== 'object' ) throw new Error('first parameter is not an object');

			function get( obj, index ){
				return _.reduce( index.split('.'), function( tmp, idx){ return tmp[idx] }, obj );
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
			checkType( this.floatArr, obj, 'number' );
			checkType( this.doubleArr, obj, 'number' );
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
			
			// float
			for( var i = 0; i < this.floatArr.length; ++ i ){
				var num = get( obj, this.floatArr[i] );
				binOut += FloatToBin( num );
			}
			
			// double
			for( var i = 0; i < this.doubleArr.length; ++ i ){
				var num = get( obj, this.doubleArr[i] );
				binOut += DoubleToBin( num );
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
				return LZString.compressToUTF16( binOut );
			else
				return binOut;
		}
		
		BCConverter.prototype.convertToClass = function( bin ){
			if( typeof bin !== 'string' ) 
				throw new Error('binary data is not in the form of string');
			
			if( this.compress ) 
				bin = LZString.decompressFromUTF16( bin );
			
			var obj = _.clone(this.baseMap);

			function set( obj, index, value ){
				var idxs = index.split('.');
				var tarr = _.chain(index.split('.'))
					.initial()
					.reduce( function(memo,idx){ return memo[idx]; }, obj )
					.value();
					
				tarr[ _.last( idxs ) ] = value;
			}
			
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
					set( obj, name, arr[i] );
				}
			}
			
			// number
			var n = this.numArr.length * 4;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.numArr.length; ++ i ){
				var name = this.numArr[i];
				set( obj, name, BinToInt( bin, ptr ) );
				ptr += 4;
			}
			
			// short
			var n = this.shortArr.length * 2;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.shortArr.length; ++ i ){
				var name = this.shortArr[i];
				set( obj, name, BinToShort( bin, ptr ) );
				ptr += 2;
			}
			
			// float
			var n = this.floatArr.length * 4;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.floatArr.length; ++ i ){
				var name = this.floatArr[i];
				set( obj, name, BinToFloat( bin, ptr ) );
				ptr += 4;
			}
			
			// double
			var n = this.doubleArr.length * 8;
			
			if( bin.length < ptr + n ){ // the amount of data given is not correct
				throw new Error('Data is corrupted');
			}
			
			for( var i = 0; i < this.doubleArr.length; ++ i ){
				var name = this.doubleArr[i];
				set( obj, name, BinToDouble( bin, ptr ) );
				ptr += 8;
			}
			
			


			
			
			// error message not coded yet
			// pascal string
			for( var i = 0; i < this.pstrArr.length; ++ i ){				
				var name = this.pstrArr[i];
				var length = BinToInt( bin, ptr );
				ptr += 4;

				set( obj, name, bin.substr( ptr, length ));
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
				set( obj, name,  str );
				++ ptr;
			}
			
			
			return obj;
		}

		return BCConverter;
	})();


	
	
	
	Converter.BCConverter = BCConverter;
	Converter.ClassConverter = BCConverter;
	
	var BCArrayConverter = (function(){
		var BCArrayConverter = function( baseConverter, compress ){
			// force not to compress data b/c compressing data twice give no benefit
			baseConverter.compress = false;
			
			this.baseConverter = baseConverter;
			this.compress 	= ( typeof compress ==='undefined' ? true : !!compress );
		}
		
		BCArrayConverter.prototype.convertToArray = function( bin ){
			if( this.compress )
				bin = LZString.decompressFromUTF16( bin );
			
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
				return LZString.compressToUTF16( binOut );
			}
			else {
				return binOut;
			}
		}
		
		
		return BCArrayConverter;
	})();
	
	Converter.BCArrayConverter = BCArrayConverter;
	Converter.ArrayConverter = BCArrayConverter;
	
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
	
	var PrimitiveArrayConverter = (function(){
		var PrimitiveArrayConverter = function(type, compress){
			var supported = [Converter.type.NUMBER];
			if( supported.indexOf(type) == -1 ) 
				throw new Error('this primitive type is not supported');
			
			this.primitive_type = type;
			this.compress 	= ( typeof compress ==='undefined' ? true : !!compress );			
		}
		
		PrimitiveArrayConverter.prototype.convertToArray = function(bin){
			var dataAppropriate = true;
			
			if( this.primitive_type == Converter.type.NUMBER ){
				dataAppropriate = (bin.length % 4 == 0);
			}
			
			if( !dataAppropriate )
				throw new Error('data given is not convertable');

			if( this.primitive_type == Converter.type.NUMBER ){
				return _.map(
					_.range(0,bin.length,4), 
					function(x){return BinToInt(bin,x); }
				);
			}
		}

		PrimitiveArrayConverter.prototype.convertToBin = function(array){
			var dataAppropriate = true;
			if( this.primitive_type == Converter.type.NUMBER ){
				dataAppropriate = _.reduce(array, function(memo,x){ return memo || (typeof(x) == 'number'); }, true);
			}
			
			if( !dataAppropriate )
				throw new Error('array given is not suitable');
			
			if( this.primitive_type == Converter.type.NUMBER ){
				return _.reduce(_.map( array, function(x){return IntToBin(x)}), function(binOut, bin){ return binOut + bin }, "");
			}
		}
		
		return PrimitiveArrayConverter;
	})();
	
	Converter.PrimitiveArrayConverter = PrimitiveArrayConverter;
	
	return Converter;
});