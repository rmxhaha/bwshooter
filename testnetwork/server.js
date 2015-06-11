var Backbone = require('Backbone');
var converter = require('./converter.js');
var game = require('./game.js');

var express = require('express');
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(30003);

/*
app.get('/', function (req, res) {
  res.sendfile(__dirname + '/index.html');
});
*/

app.use('/', express.static( __dirname ));



var Players = new game.PlayerContainer;
var idc = 0;
io.on('connection', function (socket) {
	var player = new game.Player({ x : 0,y : 0 });
	Players.push( player );
	socket.emit('keyid', player.cid );
	
	// keypress
	socket.on('k', function( data ){
		player.update( data.keypress );
	});

	console.log( JSON.stringify( Players ) );
	setInterval( function(){
		socket.emit( 'update', JSON.stringify( Players ) );
	}, 20 );
});

