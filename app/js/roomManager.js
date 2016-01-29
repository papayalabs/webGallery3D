define(["room1", "room2", "room3"], function () {

	//var rooms = [r1, r2, r3];
	var rooms = arguments;
	
	// Finds the room with the given name in the local array and returns it
	// If the room cannot be found, this returns 'undefined'
	var findRoomByName = function(name) {
		for(var i=0; i< rooms.length; i++) {			
			if(rooms[i].getRoomName() === name) {
				return rooms[i];
			}			
		}
		return undefined;
	};
	
	

	return {
		
		
		// Enter the room with the given name through the door with the given number
		enter: function(name, door) {
			var room = findRoomByName(name);
			if(room !== undefined) {
				room.enter(door);
			}
		},
		
		// Configure this instance and fire the callback when ready.
		configure : function(configuration, callback) {
		
			
			// loop through the config and connect the loaded rooms
			configuration.forEach(function(cfg) {
								
				var name = cfg.name; // name of the current room
				
				// loop through all doors and connect them
				cfg.connections.forEach(function(con){
					var exitDoor = con.exitDoor;
					var enterDoor = con.enterDoor;									
					var exitR = findRoomByName(name);
					var enterR = findRoomByName(con.enterRoom);
					
					if(exitR && enterR) {
						exitR.setLeaveCallback(function (d) {			
							if(d === exitDoor) {
								enterR.enter(enterDoor);
							}
						});
					}
			
				});
			});
			
			if(typeof callback === 'function') {
				callback();
			}
		
			
		}
	};	
});