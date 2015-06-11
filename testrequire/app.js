var requirejs = require('requirejs');

requirejs(['helper/util'], function( util ){
	console.log( util );
	util.callf();
	
	var Car = function(x){
		this.fuel = x;
		console.log( 'this is car const' );
	}

	Car.method('start', function(){
		console.log('car starting');
	});
	
	var Ferrari = function(){ console.log('my my');}
	
	Ferrari.inherits( Car );
	Ferrari.method('start', function(){
		console.log('brm brm');
	});
	
	var f = new Ferrari;
	f.start();
	
//	var car = new Car;
//	car.start();
});


