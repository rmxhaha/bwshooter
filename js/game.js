var gravity = 100; // only applied to y axis

var context = document.getElementById("canvas").getContext("2d");

function _extend(x, y) {
	for (var key in y) {
		if (y.hasOwnProperty(key)) {
			x[key] = y[key];
		}
	}

	return x;
}

var Time = function () {
	this.time = new Date();
	this.reset = function () {
		var out = this.getElapsedTime();
		this.time = new Date();

		return out;
	}

	this.getElapsedTime = function () {
		return new Date() - this.time;
	}

	this.reset();
}

function Platform(setup){
	var _default = {
		x : 0,
		y : 0,
		width : 100
	};

	_extend(this, _default);
	_extend(this, setup);
}

Platform.prototype = {
	draw : function(ctx){
		ctx.save();
		ctx.translate(camera_x, camera_y);
		ctx.fillStyle = "#888888";
		ctx.fillRect( this.x, -this.y, this.width, this.height );
		console.log( this.x, -this.y, this.width, this.height );
		ctx.restore();
	},
	height : 30
};

function Player(setup) {
	var _default = {
		x : 0,
		y : 0,
		vy : 0,
		vx : 0,
		walkSpeed : 50
	};

	_extend(this, _default);
	_extend(this, setup);
}

Player.prototype = {
	draw : (function () {
		var pimage = new Image();
		pimage.src = "art/player.png";

		return function (ctx) {
			ctx.save();
			ctx.translate(camera_x, camera_y);
			ctx.drawImage(
				pimage, 
				0,
				( this.vx > 0 ? 0 : 1 ) * this.height,
				this.width, this.height,				

				this.x - this.width / 2, 
				-this.y - this.height / 2, 
				this.width, this.height);

			ctx.restore();
		}
	})(),
	width : 150,
	height : 140,
	update : function( dt ){
		this.vy -= gravity * dt;
		this.x += this.vx * dt;
		this.y += this.vy * dt;
	}
};

var camera_x = 0;
var camera_y = 0;

var one = new Player({
		x : 100,
		y : -200,
		vy : 0,
		vx : 0,
		walkSpeed : 50
	});

var players = [];

players.push(one);

function update(dt) {
	for (var i = 0; i < players.length; ++i) {
		players[i].update( dt );
	}
}

var timer = new Time;


var p = new Platform({ x : 100, y : -300, width : 300 });

function loop() {
	var dt = timer.reset() / 1000;
	update(dt);

	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	// drawing all player
	for (var i = 0; i < players.length; ++i) {
		players[i].draw(context);
	}
	
	p.draw( context );

	requestAnimationFrame(loop);
}

window.addEventListener("keydown", function(event){
	switch( event.keyCode ){
	case 37: // left
		one.vx = -one.walkSpeed;
		break;
	case 38: // up
		break;
	case 39: // right
		one.vx = one.walkSpeed;
		break;
	case 40: // down
		break;
	}
});

window.addEventListener("keyup", function(event){
	switch( event.keyCode ){
	case 37: // left
	case 39: // right
		one.vx = 0;
		break;
	}
});

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
