var requirejs = require('requirejs');
requirejs.config({
	shim: {
        "Engine/Utility/underscore": {
            exports: "_"
        }
    }
});

requirejs(['Engine/Utility/class','express', 'http', 'socket.io','Engine/Game/ServerWorld','Engine/Game/Platform'], function( _class, express, http, socketio, World, Platform ){

var app = express();
var server = http.Server(app);
var io = socketio(43001);

app.use('/', express.static( './' ));
app.get('/', function( req, res ){
	res.redirect('/WebView/');
});

app.listen( 43000 );


var world = new World;

world.add( new Platform({ x : 200, y : -300 }));


io.on('connection', function (socket) {
	console.log(socket.id);

	socket.on('requestLogin', function( name ){
		// TODO : do checking on name 
		console.log( name );

		socket.emit('base', {
			name : name,
			basebin : world.getBaseBin()
		});
	});
	
	socket.on('disconnect', function () {
		io.emit('user disconnected');
	});
});


});