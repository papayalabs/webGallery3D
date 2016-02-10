require.config({
  paths: {
	  'three': 'lib/three.min',
	  'jquery': 'lib/jquery.min',	  
	  'stats' : 'lib/stats.min',
  },
  
  map: {
	  // '*' means all modules will get 'jquery-private'
	  // for their 'jquery' dependency.
	  '*': { 'jquery': 'jquery-private' },

	  // 'jquery-private' wants the real jQuery module
	  // though. If this line was not here, there would
	  // be an unresolvable cyclic dependency.
	  'jquery-private': { 'jquery': 'jquery' }
  }
});




requirejs(["engine", "roomManager", "tools", "jquery"], function (engine, roomManager, tools, $) {

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
							enterRoom: 'Room2', // of room #2
							//angle: tools.deg2rad(180), // The angle between the two doors
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
						},
						{
							exitDoor: 1,
							enterDoor: 0,
							enterRoom: 'Room3',
							angle: tools.deg2rad(90),
						}
					]
				},


				// Set the door-configuration of room #3
				{
					name: 'Room3', // --> This loads 'Room3.js'
					connections: [
						{
							exitDoor: 0,
							enterDoor: 1,
							//enterRoom: 'Room1',
							angle: tools.deg2rad(-90), 
							enterRoom: 'Room2',
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