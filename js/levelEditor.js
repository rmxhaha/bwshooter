var context = document.getElementById("canvas").getContext("2d");
var world = new World;

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


var map={"camera_x":0,"camera_y":0,"gravity":800,"players":[{"x":100,"y":-200,"vy":0,"vx":0,"type":0},{"x":-258,"y":0,"vy":0,"vx":0,"type":1},{"x":-705,"y":0,"vy":0,"vx":0,"type":1},{"x":-752,"y":0,"vy":0,"vx":0,"type":1},{"x":-52,"y":0,"vy":0,"vx":0,"type":1},{"x":505,"y":0,"vy":0,"vx":0,"type":1},{"x":901,"y":0,"vy":0,"vx":0,"type":1},{"x":889,"y":0,"vy":0,"vx":0,"type":1},{"x":1376,"y":0,"vy":0,"vx":0,"type":1},{"x":1433,"y":0,"vy":0,"vx":0,"type":1},{"x":1410,"y":0,"vy":0,"vx":0,"type":1}],


"platforms":[{"x":-1000,"y":-1000,"width":3000,"penetrable":false}],
"lights":[{"x":250,"y":-640,"maxRange":1000,"rayCount":400,"color":"white","opacity":1,"direction":0,"width":0.7853981633974483,"state":true,"mod":[{"name":"LightSwingingMod","speed":0.2,"angleDeviation":0.3141592653589793,"angleBase":3.141592653589793,"deg":0}]},{"x":0,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":-250,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":250,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]},{"x":500,"y":1500,"maxRange":4000,"rayCount":8000,"color":"white","opacity":0.5,"direction":3.141592653589793,"width":3.141592653589793,"state":true,"mod":[{"name":"SunFxMod","dayTime":3,"nightTime":3,"switchTime":3,"maxOpacity":1}]}],"bullets":[]} ;

parseMap( world, map );

var mx = 0;
var my = 0;

window.addEventListener( 'mousemove', function(e){
	mx = e.clientX;
	my = e.clientY;
});


world.camera_y = -800;

document.getElementById("canvas").addEventListener( 'click', function(e){
	mx = e.clientX;
	my = e.clientY;
	var radios = document.getElementsByName('selected_tool');

	var value = false;
	
	for (var i = 0, length = radios.length; i < length; i++) {
		if (radios[i].checked) {
			value = radios[i].value;
			break;
		}
	}
	
	switch( value ){
	case "addPlatform":
		var option = {};
		
		option.width = parseInt( prompt("Width", '100' ) );
		option.penetrable = ( prompt("penetrable", "true" ) == "true" ? 1 : 0 );
		
		option.x = mx - world.camera_x;
		option.y = -my + world.camera_y;
		
		console.log( option );
		
		world.add( new Platform( option ) );
		
		break;
	case "addLight":
		break;
	case "AddBlack":
		break;
	case "AddWhite":
		break;
	case "Move":
		break;
	case "Remove":
		break;
	default:
		alert("You haven't select a tool yet");
		break;
	}
	
});


var timer = new Time;
function loop() {
	var dt = timer.reset() / 1000;
	
	if( 0 <= mx && mx <= 10 )
		world.camera_x += 100 * dt;
	else if( window.innerWidth - 10 <= mx && mx <= window.innerWidth )
		world.camera_x -= 100 * dt;

	if( 0 <= my && my <= 10 )
		world.camera_y += 100 * dt;
	else if( window.innerHeight - 10 <= my && my <= window.innerHeight )
		world.camera_y -= 100 * dt;

	world.update(dt);
	world.draw(context);
	
	requestAnimationFrame(loop);
}
window.addEventListener("load", function () {
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

document.getElementById("compile").addEventListener("click" ,function(){
	window.open().document.write( JSON.stringify( world.getAllProperties() ) );
});
