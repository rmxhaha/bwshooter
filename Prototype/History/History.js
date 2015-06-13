define([], function(){
	function mod( n, d ){
		var x = n % d;
		if( x < 0 ) x += d;

		return x;
	}
	
	var History = function( howfarback, firstsnapshot ){
		array = this.pastData = [firstsnapshot];
		
		// snapshot counts from 0
		this.latestSnapshotNumber = 0;

		array.length = howfarback;
	}
	
	History.prototype = {
		getLatestSnapshotNumber : function(){
			return this.latestSnapshotNumber;
		},
		getSnapshot : function( snapshotNumber )
		{
			if( snapshotNumber > this.latestSnapshotNumber ){
				return new Error('snapshot id hasn\'t exist yet');
			}

			var diff = this.latestSnapshotNumber - snapshotNumber;
			if( diff >= this.pastData.length ) 
				return new Error('data has been overwritten');

			return this.pastData[ mod( snapshotNumber, this.pastData.length ) ];
		},
		getLatest : function(){
			var ptr = mod( this.latestSnapshotNumber, this.pastData.length );
			return this.pastData[ ptr ];
		},
		updateSnapshot : function( snapshot ){
			this.latestSnapshotNumber ++;
			var ptr = mod( this.latestSnapshotNumber, this.pastData.length );
			this.pastData[ ptr ] = snapshot;
			return this.latestSnapshotNumber;
		}
	};
	
	return History;
});

