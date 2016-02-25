define(["QUnit", "local/baseTest", "local/roomManagerTest", "bridge"], function(QUnit, test1, roomManagerTest) {
	return {
	
		run : function() {
			test1.run();		
			roomManagerTest.run();			
		},
	}
});