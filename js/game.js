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

function Player(setup) {
	var _default = {
		x : 0,
		y : 0,
		vy : 0
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
			ctx.drawImage(pimage, this.x - this.width / 2, -this.y - this.height / 2, this.width, this.height);

			ctx.restore();
		}
	})(),
	width : 150,
	height : 140
};

var camera_x = 0;
var camera_y = 0;

var one = new Player({
		x : 100,
		y : -200,
		vy : 0
	});

var players = [];

players.push(one);

function update(dt) {
	var gravity = 100; // only applied to y axis

	// to all object out there apply gravity
	for (var i = 0; i < players.length; ++i) {
		var p = players[i];

		p.vy -= gravity * dt;
		p.y += p.vy * dt;
	}
}

var timer = new Time;

function loop() {
	var dt = timer.reset() / 1000;
	update(dt);

	context.clearRect(0, 0, window.innerWidth, window.innerHeight);
	// drawing all player
	for (var i = 0; i < players.length; ++i) {
		players[i].draw(context);
	}

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
