var socket = io.connect('http://localhost:30003');

var kid = 0;
var Players = new PlayerContainer;
var PlayerViews = new PlayerCollectionView({ collection : Players });
socket.on('keyid', function (data) {
	console.log(data);
	kid = data;
});

socket.on('update', function(players){
	Players = new PlayerContainer( JSON.parse( players ) );
	PlayerViews = new PlayerCollectionView({ collection : Players });
});

var latestKeyDown = 0;

setInterval( function(){
	socket.emit('k', { keyid : kid, keypress : latestKeyDown } );
	PlayerViews.render();
}, 20 );

window.addEventListener("keydown", function(event){
	latestKeyDown = event.keyCode;
});

window.addEventListener("keyup", function(event){
	latestKeyDown = 0;
});	
