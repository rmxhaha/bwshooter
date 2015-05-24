/********************************
* Revival Version of Black White Shooter project 
* 	Rewriting the code to use backbone MVC
*	All logic will be maintained
*	
* Author : rmxhaha 
* Date   : 19 May 2015
*********************************/

Backbone.$ = function( element ){
	return element.getContext('2d');
};

var PlayerCircularReloadBar = Backbone.View.extend({
	defaults : {
		outerWidth : 100,
		innerWidth : 90,
		color : "yellow",
		opacity : 0.5
	},
	tagName : 'canvas',
	initialize : function(){
		this.options = _.extend({}, this.defaults, this.options);
		console.log( this );
		this.set('context', this.el.getContext("2d") );
	},
	
	render : function(){
		// canvas 
		var ctx = this.$el;

		var x = this.model.get('x');
		var y = this.model.get('y');
		var startAngle = 0;
		var endAngle = this.model.getTimeLeftToFinishReload() / this.model.getReloadTime();
		
		var outerWidth = this.get('outerWidth');
		var innerWidth = this.get('innerWidth');
		var color = this.get('color');
		var opacity = this.get('opacity');
		
		ctx.save();

		ctx.fillStyle = color;
		ctx.globalAlpha = opacity;

		ctx.beginPath();
		ctx.arc( x, -y, outerWidth, startAngle, endAngle, true );
		ctx.arc( x, -y, innerWidth, endAngle, startAngle, false );
		ctx.closePath();

		ctx.fill();
		ctx.restore();
	}
});
