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
	'Engine/Utility/Time',
	'express', 
	'http', 
	'socket.io',
	'Engine/Game/ServerWorld',
	'Engine/Game/Platform',
	'Engine/Game/Light',
	'Engine/Game/Player'
], function( _class, Time, express, http, socketio, World, Platform, Light, Player ){

var app = express();
var server = http.Server(app);
var io = socketio(43001);

app.use('/', express.static( './' ));
app.get('/', function( req, res ){
	res.redirect('/WebView/');
});

app.listen( 43000 );


var world = new World;

world.add( new Platform({ x : 200, y : -500 }));
world.add( new Platform({ x : 500, y : -300 }));
world.add( new Player({ x : 200, y : -300, team : Player.team.white, name : 'randomname' }));
world.add( new Player({ x : 500, y : -150, team : Player.team.black }));
world.add( new Light({
	x : 200, 
	y : -200,
	turnedOn : true,
	angle : Math.PI,
	angleWidth : Math.PI / 5,
	fx : {
		swinging : {
			on : true
		},
		flicker : {
			on : true
		},
		sun : {
			on : true,
			dayTime : 3,
			nightTime : 3,
			time : 6
		}
	}
}) );
world.add( new Light({
	x : 600, 
	y : -100,
	turnedOn : true,
	angle : Math.PI,
	angleWidth : Math.PI / 5,
	fx : {
		swinging : {
			on : true,
			deg : 2
		},
		flicker : {
			on : true
		},
		sun : {
			on : true,
			dayTime : 3,
			nightTime : 3,
			time : 6
		}
	}
}) );


var time = new Time;
setInterval( function(){
	world.update(time.reset() / 1000);
	io.to('Room1').emit( 'update', world.getUpdateBin() );
},0);



io.on('connection', function (socket) {
	console.log(socket.id);

	socket.on('ping', function(){
		socket.emit('pong');
	});
	
	
	//playerObject.setKeyAction();

	socket.on('requestLogin', function( name ){
		// TODO : do checking on name 
		console.log( name );

		socket.join('Room1');
		

		//-- spawn player 

		var playerObject = new Player({
			x : 200 + 500 * Math.random(),
			y : -500,
			team : Player.team.white,
			name : name
		});
		
		world.add( playerObject );
	
		
		// must send after player added
		// system cannot handle new player
		// TODO : make it so it can
		
		socket.emit('base', {
			name : name,
			basebin : world.getBaseBin()
		});
		
		
		socket.on('disconnect', function(){
			console.log( name + ' has left the room');
			world.remove( playerObject );
		});
	});
	

	socket.on('keyAct', function( keyAction ){

	});
});


});