// simulate require-js

testVars = {
	enterCallback : function() {},	
};

require = function(names, callback) {

	var roomName = names[0];

	// Return an mockup-room
	callback({
		name : roomName,
		enter : function(door) {
			console.log('Enter was called on room ' + roomName + ' with door ' + door);			
			testVars.enterCallback(roomName, door);
		},
		setLeaveCallback : function(callback) {
			console.log('Leave-callback was set for room ' + roomName);
			leaveCallbackCounter++;
		},
	});
};



define = function(dependencies, callback)
{
	QUnit.start();

	QUnit.test("Create room manager", function(assert) {
				
		// execute the callback from the require-'define'-function
		var manager = callback();
		
		assert.ok(manager.enter !== undefined, "An room-manager was created");							
	});	
	
	
	QUnit.test("Create room manager and configure it", function(assert) {
				
		
		var done = assert.async();
		
		// execute the callback from the require-'define'-function
		var roomManager = callback();
		
		assert.ok(roomManager.enter !== undefined, "An room-manager was created");		

		// Configure the rooms
		roomManager.configure(
		[
			// Set the door-configuration of room #1
			{
				name : 'Room1', // Must be the name of the JS-file --> This loads 'Room1.js'
				
				// Array with all door-configrations of this room
				connections : [
					{
						exitDoor : 0,	// When exiting through door #0...
						enterDoor : 0,  // Enter through door #0...
						enterRoom : 'Room2' // of room #2
					},
					{
						exitDoor : 1,	
						enterDoor : 2, 
						enterRoom : 'Room3' 
					}
					
				]
			},
			
			
		], 
		
		// Callback which gets executed when the rooms were configured and loaded
		function() {
			console.log('Room manager was configured');
			
			var cnt = 0;
			var enterEvents = [];
			
			testVars.enterCallback = function(roomName, door) {
				enterEvents.push({
					r : roomName,
					d : door
				});
			
				cnt++;
				
				if(cnt === 2) {

					assert.strictEqual(enterEvents.length, 2, "The enter-event was fired twice");
					assert.strictEqual(enterEvents[0].r, 'Room1', "Entering room1");
					assert.strictEqual(enterEvents[0].d, 1, "Enter room1 through door 1");
					assert.strictEqual(enterEvents[1].r, 'Room1', "Entering room1 again");
					assert.strictEqual(enterEvents[1].d, undefined, "The door number is undefined");
					done();	
				}
			};
			
			roomManager.enter('Room1', 1);			
			roomManager.enter('Room1');
			
			
					
		});
		
		
	});	
};