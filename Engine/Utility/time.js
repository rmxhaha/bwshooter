define([], function(){
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
	
	return Time;
});