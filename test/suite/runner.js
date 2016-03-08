define(["QUnit", "local/baseTest", "local/roomManagerTest", "local/skyBoxTest", "bridge"], function(QUnit, test1, roomManagerTest, skyBoxTest) {
	return {
	
		run : function() {
			test1.run();		
			roomManagerTest.run();	
			skyBoxTest.run();			
		},
	}
});