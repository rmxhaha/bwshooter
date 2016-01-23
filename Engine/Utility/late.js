define(['Engine/Utility/underscore'], function(_){
	/**
		Late
			for function that must execute on certain event[1]
			but must wait for a few other event[2] to emit
			The event[1] might be happening before these few other event[2]
	*/
	var Late = (function(){
		var state = {
			READY : 1,
			NOT_READY : 0
		};
				
		/**
			constructor
			
			@param waitFors type array of function 
				function that register a listener 
			@param trigger a function
				function that register a listener
		*/
		var Late = function( waitFors, trigger ){
			this.initWaitFors( waitFors );
			this.queue = [];
			this.listener = function(){
				if( this.state == state.READY )
					this.process_event.apply(null, arguments);
				else
					this.queue.push(arguments);
			}
			trigger( this.listener.bind(this) );
		};

		Late.state = state;

		_.extend(Late.prototype, {

			// this may be use to reset the ready state of Late
			initWaitFors : function(waitFors){
				this.state = state.NOT_READY;
				this.waitForStates = [];
				this.waitForStates.length = waitFors.length;

				var late = this;
				for( var i = 0; i < waitFors.length; ++ i ){
					late.waitForStates[i] = state.NOT_READY;
					
					(function(i){
						waitFors[i](function(){
							late.waitForStates[i] = state.READY;
							late.checkout_readiness();
						});
					})(i);
				}
			}
		});
		
		_.extend(Late.prototype, {
			process_event : function(){},
			trigger_ready : function(){
				this.state = state.READY;
								
				// process all early packet
				while( this.queue.length > 0 ){
					var args = this.queue.shift();
					this.process_event.apply(null, args);
				}
			},
			checkout_readiness : function(){
				var is_ready = _.reduce( this.waitForStates, function(memo, _state){ return memo && _state == state.READY; }, true );
				
				if( is_ready )
					this.trigger_ready();
			}
		});
		
		return Late;
	})();
	
	return Late;
});