define(['underscore'], function( _ ){
	function mod( n, d ){
		var x = n % d;
		if( x < 0 ) x += d;

		return x;
	}
	
	var defaults = {
		lastSnapshotNumber : 0,	
		/**
			lastSnapshotNumber
				snapshot should counts from 0 but may be overriden.
				if overriden and non-existent snapshot within snapshot history length is requested , error wasn't produced
		*/
		debug : false,
		historyLength : 5
	};
	
	/***
		How to use `History` class
		
		#1 way
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
			
			console.log( myHistory.get(v1) ); // Error : data has been overwritten
			
		#2 way
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
	*/

	var History = function( option ){
		_.extend( this, defaults );
		_.extend( this, option );
		
		
		// initialization
		
		if( !(this.snapshots instanceof Array) ){
			this.snapshots = [ this.first ];
			this.pointer = 0;
		}
		else {
			if( this.debug && this.snapshots.length === 0 )
				throw new Error('snapshots may not be empty');
			this.pointer = this.snapshots.length - 1;
		}

		if( this.snapshots.length < this.historyLength )
			this.snapshots.length = this.historyLength;
		
		
		delete this.historyLength;
		delete this.first;
	}
	
	History.prototype = {
		getlastSnapshotNumber : function(){
			return this.lastSnapshotNumber;
		},
		get : function( snapshotNumber )
		{
			if( snapshotNumber > this.lastSnapshotNumber ){
				if( !this.debug )
					return false;
				else
					return new Error('snapshot id hasn\'t exist yet');
			}

			var diff = this.lastSnapshotNumber - snapshotNumber;
			if( diff >= this.snapshots.length )
				if( this.debug )
					return new Error('data has been overwritten');
				else
					return false;

			if( this.pointer < diff )
				if( this.debug )
					return new Error('data doesn\'t exist');
				else
					return false;
			return this.snapshots[ mod( this.pointer - diff, this.snapshots.length ) ];
		},
		getLatest : function(){
			return this.snapshots[ this.pointer ];
		},
		update : function( snapshot ){
			this.lastSnapshotNumber ++;
			this.pointer ++ ;
			this.snapshots[ mod( this.pointer, this.snapshots.length ) ] = snapshot;
			return this.lastSnapshotNumber;
		}
	};
	
	return History;
});

