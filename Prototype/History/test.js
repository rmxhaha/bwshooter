var requirejs = require('requirejs');
requirejs(['History'], function( History ){
	var myHistory =  new History({
		first : 1, // version 1
		historyLength : 3,
		debug : true
	});
	
	var v1 = myHistory.getlastSnapshotNumber();
	var v2 = myHistory.update( 2 ); // version 2
	var v3 = myHistory.update( 3 ); // version 3

	console.log( myHistory.getLatest() ); // version 3 is written
	console.log( myHistory.get(v2) ); // version 2 is written 
	console.log( myHistory.get(v3) ); // version 3 is written
	
	myHistory.update( 5 ); // version 4 and version 1 will be overwritten
	
	console.log( myHistory.get(v1) ); // data has been overwritten
		

	var myHistory = new History({
		snapshots : [1,2,3],
		lastSnapshotNumber : 7,  // referring to the last snapshots which is `3` in this case


		// if `snapshots` exist then `first` is ignored
		first : 999, 
		
		// if `historyLength` < `snapshots.length` then it's ignored
		historyLength : 5,
		debug : true
	});
	
	
	console.log( myHistory.getLatest()); // 3
	console.log( myHistory.get(4) ); // data doesn't exist
	console.log( myHistory.get(5) ); // 1
	console.log( myHistory.get(6) ); // 2
	console.log( myHistory.get(7) ); // 3
	console.log( myHistory.get(8) ); // snapshot id hasn't exist yet
});
