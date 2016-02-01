define(["QUnit", "bridge"], function(QUnit) {
	return {
		run : function() {
			
			QUnit.test('Check if QUnit executes tests with require', function(assert) {
				var done = assert.async();
				
				assert.ok(true, 'Require executes the test');
				done();
			});
		},
	}
});