define(["QUnit", "local/baseTest", "local/roomManagerTest", "local/skyBoxTest", "local/spriteTest", "bridge"], function(QUnit, test1, roomManagerTest, skyBoxTest, spriteTest) {
	return {
	
		run : function() {
			test1.run();		
			roomManagerTest.run();	
			skyBoxTest.run();		
			spriteTest.run();
		},
	}
});