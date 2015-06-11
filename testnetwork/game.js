(function(global){
	if( typeof require === 'function'){
		Backbone = require('Backbone');
		_ = require('underscore');
		Converter = require('./converter.js');
		BCConverter = Converter.BCConverter;
	}
	
	var PlayerDataConverter = new BCConverter([
		{ name : 'x', type : BCConverter.type.NUMBER },
		{ name : 'y', type : BCConverter.type.NUMBER },
		{ name : 'moveDirection', type : BCConverter.type.NUMBER }
	]);
	
	var KeyAct = (function(){
		function KeyAct(){
			this.left = false;
			this.right = false;
			this.up = false;
			this.down = false;
		}
		
		var KeyActConverter = new BCConverter([
			{ name : 'left', type : BCConverter.type.BOOLEAN },
			{ name : 'right', type : BCConverter.type.BOOLEAN },
			{ name : 'up', type : BCConverter.type.BOOLEAN },
			{ name : 'down', type : BCConverter.type.BOOLEAN }
		], false);
		
		KeyAct.prototype = {
			toBin : function(){
				return KeyActConverter.convertToBin( this );
			},
			parseBin : function( bin ){
				_.extend( this, KeyActConverter.convertToClass( bin ) );
			}
		}
		
		return KeyAct;
	})();
	
	var k = new KeyAct;
	k.left = true;
	var y = new KeyAct;
	console.log( k.toBin() );
	console.log( y.parseBin( k.toBin() ) );
	console.log( y );
	
	global.KeyAct = KeyAct;
	
	var Player = (function(){
		var Player = function( p ){
			var defaults = {
				x : 0,
				y : 0,
				hmove : 0,
				vmove : 0
			};

			_.extend( this, defaults );
			_.extend( this, p );
		}
		
		// per timestep
		var vx = 10;
		var vy = 10;

		Player.prototype = {
			stop : function(){
				this.hmove = 0;
				this.vmove = 0;
			},
			moveLeft : function(){ this.hmove = -1; },
			moveRight : function(){ this.hmove = 1;},
			moveUp : function(){ this.vmove = 1; },
			moveDown : function(){ this.vmove = -1; },
			update : function( keyAct )
			{
				this.stop();
				
				if( keyAct.left ){
					this.moveLeft();
				}
				else if( keyAct.right ){
					this.moveRight();
				}
				
				if( keyAct.up ){
					this.moveUp();
				}
				else if( keyAct.down ){
					this.moveDown();
				}

				this.x += vx * this.hmove;
				this.y += vy * this.vmove;
			},
			toBin : function(){ return PlayerDataConverter.convertToBin(this); },
			parseBin : function( bin ){ 
				_.extend( this, PlayerDataConverter.convertToClass(bin) );
			}
		}
		
		
		return Player;
	})();
	
	var Player = Backbone.Model.extend({
		defaults : {
			x : 0,
			y : 0,
			moveDirection : 0
		},
		timestep : 0.05,
		vx : 100,
		vy : 100,
		toBin : function(){ return PlayerDataConverter.convertToBin(this); },
		parseBin : function( bin ){ this.set( PlayerDataConverter.convertToClass(bin) ); },
		stop : function(){ this.set({ moveDirection : 0 }); },
		moveUp : function(){ this.set({ moveDirection : 1 }); },
		moveDown : function(){ this.set({ moveDirection : 2 }); },
		moveLeft : function(){ this.set({ moveDirection : 3 }); },
		moveRight : function(){ this.set({ moveDirection : 4 }); },
		update : function( keyAct ){
			
		}
	});

	var PlayerContainer = Backbone.Collection.extend({
		model : Player
	});

	var PlayerView = Backbone.View.extend({
		initialize : function(){
			this.on('update', this.render.bind(this) );
		},
		render : function( context )
		{
			var radius = 70;
			var model = this.model;	

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

	var PlayerCollectionView = Backbone.View.extend({
		initialize : function(){
			var that = this;
			this._PlayerViews = [];
			
			this.collection.each( function( player ){
				that._PlayerViews.push( 
					new PlayerView({ model : player })
				);
			});
				console.log( this._PlayerViews.length );

			var canvas = document.getElementById('myCanvas');
			var context = canvas.getContext('2d');

			this.context = context;
		},
		render : function(){
			var context = this.context;
		
			context.clearRect( 0,0,1000,500 );
			_( this._PlayerViews ).each(function(pv){
				pv.render( context );
			});
		}
	});
	
	global.Player = Player;
	global.PlayerContainer = PlayerContainer;
	global.PlayerCollectionView = PlayerCollectionView;
	global.PlayerView = PlayerView;
	
})( this );
