define([], function () {

	var deg2RadFactor = Math.PI / 180;

	return {
		// detects wether the given object is an array
		isArray : function(obj) {
			var toClass = {}.toString;
			return toClass.call(obj) === '[object Array]';
		},
		
		// Converts degrees to radiant
		deg2rad : function(degrees) {
			return degrees * deg2RadFactor;
		},
	};
});