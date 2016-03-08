define(["QUnit", "roomManager"], function(QUnit, roomManager) {


	var testVars = {
		enterCallback : function() {},	
	},
	
	performance = performance || {
		now : function() {
			return Date.now();
		}
	};

	
	
	return {	
		run : function() {
			QUnit.test("Create room manager and configure it", function(assert) {
						
				var done = assert.async(),											
					cnt = 0,
					enterEvents = [];
				
				
				assert.ok(roomManager.enter !== undefined, "An room-manager was created");	

				// overwrite the enter-function of the room-manager
				roomManager.enter = function(name, door) {
						console.log('Enter was called on room ' + name + ' with door ' + door);			
						testVars.enterCallback(name, door);
					};
				
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
						
						
					]);
				
				
				
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
		}
	}
});