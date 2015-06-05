var Player = Backbone.Model.extend({
	defaults : {
		x : 0,
		y : 0,
		moveDirection : 0
	},
	timestep : 0.05,
	vx : 100,
	vy : 100,
	stop : function(){ this.set({ moveDirection : 0 }); },
	moveUp : function(){ this.set({ moveDirection : 1 }); },
	moveDown : function(){ this.set({ moveDirection : 2 }); },
	moveLeft : function(){ this.set({ moveDirection : 3 }); },
	moveRight : function(){ this.set({ moveDirection : 4 }); },
	update : function( keyAct ){
		switch( keyAct ){
		case 37: // left
			this.moveLeft();
			break;
		case 39: // right
			this.moveRight();
			break;
		case 38: // up
			this.moveUp();
			break;
		case 40: // down
			this.moveDown();
			break;
		default:
			this.stop();
		}

		var moveDir = this.get('moveDirection');
		switch( moveDir ){
		case 4:
			this.set({ x : this.get('x') + this.vx * this.timestep });
			break;
		case 3:
			this.set({ x : this.get('x') - this.vx * this.timestep });
			break;
		case 1:
			this.set({ y : this.get('y') + this.vy * this.timestep });
			break;
		case 2:
			this.set({ y : this.get('y') - this.vy * this.timestep });
			break;
		}
		
		
	}
});

var PlayerView = Backbone.View.extend({
	initialize : function(){
		this.render();
		this.on('update', this.render.bind(this) );
	},
	render : function( keyAct )
	{

		var canvas = document.getElementById('myCanvas');
		var context = canvas.getContext('2d');
		var radius = 70;
		var model = this.model;	

		context.clearRect( 0,0,1000,500 );
		context.beginPath();
		context.arc(
			model.get('x'), 500 - model.get('y'), 
			radius, 
			0, 2 * Math.PI, 
			false
		);
		context.fillStyle = 'green';
		context.fill();
		context.lineWidth = 5;
		context.strokeStyle = '#003300';
		context.stroke();
	}
});
