var context = document.getElementById("canvas").getContext("2d");
var world = new World;

var one = false;

function parseMap( world, map ){
	for( var i in map.platforms ){
		world.add( new Platform( map.platforms[i] ) );
	}

	for( var i in map.players ){
		var modSetup = map.players[i].mod;
		var p = new Player( map.players[i] );
		
		if( i == 0 ) {
			p.main = true;
			one = p;
		}
		
		// don't worry; it won't give an error even is modSetup is undefined or a number
		for( var x in modSetup ){			
			p.addMod( modSetup[x] );
		}
		
		world.add(p);
	}
	
	for( var i in map.lights ){
		var modSetup = map.lights[i].mod;
		var L = new Light( map.lights[i] );
		
		// don't worry; it won't give an error even is modSetup is undefined or a number
		for( var x in modSetup ){			
			L.addMod( modSetup[x] );
		}
		
		world.add( L );
	}
}

var map = {"platforms":[{"x":100,"y":-600,"width":300},{"x":460,"y":-610,"width":100},{"x":-600,"y":-800,"width":150},{"x":-800,"y":-100,"width":150},{"x":610,"y":-620,"width":100},{"x":-400,"y":-700,"width":150},{"x":-600,"y":-200,"width":150},{"x":760,"y":-630,"width":100},{"x":-200,"y":-600,"width":150},{"x":-400,"y":-300,"width":150},{"x":910,"y":-640,"width":100},{"x":0,"y":-500,"width":150},{"x":-200,"y":-400,"width":150},{"x":-555.6004676036537,"y":-158.28863084316254,"width":100},{"x":872.3836676217616,"y":-281.16549593396485,"width":100},{"x":-203.38383596390486,"y":-225.23616773542017,"width":100},{"x":-388.02086375653744,"y":-151.79598722606897,"width":100},{"x":-522.6957546547055,"y":143.85282357688993,"width":100},{"x":845.9770348854363,"y":72.35160719137639,"width":100},{"x":953.2874398864806,"y":-135.8444186160341,"width":100},{"x":-107.34839644283056,"y":44.61251285392791,"width":100},{"x":-361.9330623187125,"y":120.64548411872238,"width":100},{"x":526.4587854035199,"y":62.4206124804914,"width":100},{"x":-1000,"y":-1000,"width":3000,"penetrable":false}],


"players":[
	{"x":100,"y":-200,"vy":0,"vx":0,"walkVelocity":150,"type":0,"main":true,"mod":{"reloadBarMod":{}}},{"x":-258,"y":0,"type":1},{"x":-705,"y":0,"type":1},{"x":-752,"y":0,"type":1},{"x":-52,"y":0,"type":1},{"x":505,"y":0,"type":1},{"x":901,"y":0,"type":1},{"x":889,"y":0,"type":1},{"x":1376,"y":0,"type":1},{"x":1433,"y":0,"type":1},{"x":1410,"y":0,"type":1}],
	
	
"lights":[
	{"x":250,"y":-640,"color":"white","opacity":1,"rayCount":400,"width":0.7853981633974483,"maxRange":1000,"mod":{"LightSwingingMod":{"speed":0.2}}},
	
	
	{"x":0,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,
		"mod":{"SunFxMod":{"dayTime":3,"nightTime":3}}},
		
	{"x":-250,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":{"SunFxMod":{"dayTime":3,"nightTime":3}}},{"x":250,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":{"SunFxMod":{"dayTime":3,"nightTime":3}}},{"x":500,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":{"SunFxMod":{"dayTime":3,"nightTime":3}}}]};
var map={"platforms":[{"x":100,"y":-600,"width":300},{"x":460,"y":-610,"width":100},{"x":-600,"y":-800,"width":150},{"x":-800,"y":-100,"width":150},{"x":610,"y":-620,"width":100},{"x":-400,"y":-700,"width":150},{"x":-600,"y":-200,"width":150},{"x":760,"y":-630,"width":100},{"x":-200,"y":-600,"width":150},{"x":-400,"y":-300,"width":150},{"x":910,"y":-640,"width":100},{"x":0,"y":-500,"width":150},{"x":-200,"y":-400,"width":150},{"x":-555.6004676036537,"y":-158.28863084316254,"width":100},{"x":872.3836676217616,"y":-281.16549593396485,"width":100},{"x":-203.38383596390486,"y":-225.23616773542017,"width":100},{"x":-388.02086375653744,"y":-151.79598722606897,"width":100},{"x":-522.6957546547055,"y":143.85282357688993,"width":100},{"x":845.9770348854363,"y":72.35160719137639,"width":100},{"x":953.2874398864806,"y":-135.8444186160341,"width":100},{"x":-107.34839644283056,"y":44.61251285392791,"width":100},{"x":-361.9330623187125,"y":120.64548411872238,"width":100},{"x":526.4587854035199,"y":62.4206124804914,"width":100},{"x":-1000,"y":-1000,"width":3000,"penetrable":false}],"players":[{"x":100,"y":-200,"vy":0,"vx":0,"walkVelocity":150,"type":0,"main":true,"mod":[{name:"reloadBarMod"}]},{"x":-258,"y":0,"type":1},{"x":-705,"y":0,"type":1},{"x":-752,"y":0,"type":1},{"x":-52,"y":0,"type":1},{"x":505,"y":0,"type":1},{"x":901,"y":0,"type":1},{"x":889,"y":0,"type":1},{"x":1376,"y":0,"type":1},{"x":1433,"y":0,"type":1},{"x":1410,"y":0,"type":1}],"lights":[{"x":250,"y":-640,"color":"white","opacity":1,"rayCount":400,"width":0.7853981633974483,"maxRange":1000,"mod":[{"name":"LightSwingingMod","speed":0.2}]},{"x":0,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3}]},{"x":-250,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3}]},{"x":250,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3}]},{"x":500,"y":1500,"color":"white","opacity":0.5,"rayCount":8000,"maxRange":4000,"direction":3.141592653589793,"width":3.141592653589793,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3}]}]};
var map={"camera_x":0,"camera_y":0,"gravity":800,"players":[{"x":100,"y":-200,"vy":0,"vx":0,"type":0},{"x":-258,"y":0,"vy":0,"vx":0,"type":1},{"x":-705,"y":0,"vy":0,"vx":0,"type":1},{"x":-752,"y":0,"vy":0,"vx":0,"type":1},{"x":-52,"y":0,"vy":0,"vx":0,"type":1},{"x":505,"y":0,"vy":0,"vx":0,"type":1},{"x":901,"y":0,"vy":0,"vx":0,"type":1},{"x":889,"y":0,"vy":0,"vx":0,"type":1},{"x":1376,"y":0,"vy":0,"vx":0,"type":1},{"x":1433,"y":0,"vy":0,"vx":0,"type":1},{"x":1410,"y":0,"vy":0,"vx":0,"type":1}],"platforms":[{"x":100,"y":-600,"width":300,"penetrable":true},{"x":460,"y":-610,"width":100,"penetrable":true},{"x":-600,"y":-800,"width":150,"penetrable":true},{"x":-800,"y":-100,"width":150,"penetrable":true},{"x":610,"y":-620,"width":100,"penetrable":true},{"x":-400,"y":-700,"width":150,"penetrable":true},{"x":-600,"y":-200,"width":150,"penetrable":true},{"x":760,"y":-630,"width":100,"penetrable":true},{"x":-200,"y":-600,"width":150,"penetrable":true},{"x":-400,"y":-300,"width":150,"penetrable":true},{"x":910,"y":-640,"width":100,"penetrable":true},{"x":0,"y":-500,"width":150,"penetrable":true},{"x":-200,"y":-400,"width":150,"penetrable":true},{"x":-555.6004676036537,"y":-158.28863084316254,"width":100,"penetrable":true},{"x":872.3836676217616,"y":-281.16549593396485,"width":100,"penetrable":true},{"x":-203.38383596390486,"y":-225.23616773542017,"width":100,"penetrable":true},{"x":-388.02086375653744,"y":-151.79598722606897,"width":100,"penetrable":true},{"x":-522.6957546547055,"y":143.85282357688993,"width":100,"penetrable":true},{"x":845.9770348854363,"y":72.35160719137639,"width":100,"penetrable":true},{"x":953.2874398864806,"y":-135.8444186160341,"width":100,"penetrable":true},{"x":-107.34839644283056,"y":44.61251285392791,"width":100,"penetrable":true},{"x":-361.9330623187125,"y":120.64548411872238,"width":100,"penetrable":true},{"x":526.4587854035199,"y":62.4206124804914,"width":100,"penetrable":true},{"x":-1000,"y":-1000,"width":3000,"penetrable":false}],"lights":[{"x":250,"y":-640,"maxRange":1000,"rayCount":400,"color":"white","opacity":1,"direction":0,"width":0.7853981633974483,"state":true,"mod":[{"name":"LightSwingingMod","speed":0.2,"angleDeviation":0.3141592653589793,"angleBase":3.141592653589793,"deg":0}]},{"x":0,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":-250,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":250,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":500,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]}],"bullets":[]} ;
function focusCamera(){
	world.camera_x = -one.x + window.innerWidth/2 - one.width/2;
	world.camera_y = one.y + window.innerHeight/2 - one.height/2;
}

parseMap( world, map );


var timer = new Time;
function loop() {
	var dt = timer.reset() / 1000;

	world.update(dt);
	focusCamera();
	world.draw(context);
	
	requestAnimationFrame(loop);
}

var keyDownPressed = false;

window.addEventListener("keydown", function(event){
	switch( event.keyCode ){
	case 17: // ctrl
	case 88: // X
		one.shoot();
		break;
	case 37: // left
		one.goLeft();
		break;
	case 39: // right
		one.goRight();
		break;
	case 38: // up
	case 32: // spacebar
	case 67: // C
		if( !keyDownPressed ){
			one.jump();
		}
		else {
			one.fall();
		}
		break;
	case 40: // down
		keyDownPressed = true;
		break;
	}
});

window.addEventListener("keyup", function(event){
	switch( event.keyCode ){
	case 37: // left
	case 39: // right
		one.vx = 0;
		break;
	case 40:
		keyDownPressed = false;
	}
});

window.addEventListener("load", function () {
	console.log( JSON.stringify( world.getAllProperties() ) );
	
	adjustCanvas();
	loop();
});

window.addEventListener("resize", function () {
	adjustCanvas();
});

function adjustCanvas() {
	var canvas = document.getElementById("canvas");
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}