requirejs(["engine", "roomManager", "jquery-2.2.0.min"], function (engine, roomManager) {

	$(document).ready(function() {
	
		// initialize the renderer
		engine.init();

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
						}
						// enter more doors of room #1 here...
					]
				},
				
				// Set the door-configuration of room #2
				{
					name : 'Room2', // --> This loads 'Room2.js'
					connections : [
						{
							exitDoor : 0,
							enterDoor : 0,
							enterRoom : 'Room1'
						}
					]
				},
				
				// enter more rooms here...
			]);
				
		// Start the animation
		engine.run();

		// Load room1
		roomManager.enter('Room1');
		
	});
});