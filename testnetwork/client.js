var P1 = new Player({
	x : 0,
	y : 0
});

var PV1 = new PlayerView({
	model : P1
});


P1.moveRight();
P1.moveUp();

var latestKeyDown = 0;

setInterval( function(){
	P1.update( latestKeyDown );
	PV1.render();
}, 20 );


window.addEventListener("keydown", function(event){
	latestKeyDown = event.keyCode;
});

window.addEventListener("keyup", function(event){
	latestKeyDown = 0;
});	
