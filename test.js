var requirejs = require('requirejs');
requirejs.config({
	shim: {
        "Engine/Utility/underscore": {
            exports: "_"
        }
    }
});
requirejs([
	'Engine/Utility/class',
	'Engine/Utility/time',
	'express', 
	'http', 
	'socket.io',
	'Engine/Game/ServerWorld',
	'Engine/Game/Platform',
	'Engine/Game/Light',
	'Engine/Game/Player',
	'Engine/Utility/Converter',
	'Engine/Utility/late'
], function( _class, Time, express, http, socketio, World, Platform, Light, Player, c, Late ){
	var converter = new c.PrimitiveArrayConverter(c.type.NUMBER);
	console.log( converter.convertToArray( converter.convertToBin([-10,10,9,3,20]) ));
	
	console.log( c.BinToInt(c.IntToBin(-100),0) );
	console.log( c.BinToShort(c.ShortToBin(-132768),0) );
	
	var events = {
		onok1 : function(){},
		onok2 : function(){},
		trigger : function(){}
	};
	
	var waitFors = [
		function(listener){ events.onok1 = listener; },
		function(listener){ events.onok2 = listener; }
	];
	
	function ontrigger(listener){
		events.trigger = listener;
	}
	
	
	
	var late = new Late(waitFors, ontrigger );
	
	late.process_event = function(){
		console.log( arguments );
	}
	
	events.trigger('i am real');

	events.onok1();
	events.onok2();
	
	events.trigger('not so');
	events.trigger(3,2,2);
});
