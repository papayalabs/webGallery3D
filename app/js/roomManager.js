define(["tools", "room1", "room2", "room3"], function (tools) {

	
	var rooms = [],
	
	
	// Finds the room with the given name in the local array and returns it
	// If the room cannot be found, this returns 'undefined'
	findRoomByName = function(name) {
		for(var i=0; i< rooms.length; i++) {
			if(rooms[i].getRoomName() === name) {
				return rooms[i];
			}						
		}
		return undefined;
	};
	
	
	// find all room instances in the given function-parameters and push them in the 'rooms'-array
	(function(args){
		for(var i=0; i< args.length; i++) {	
			if (typeof args[i].getRoomName === 'function') {
				rooms.push(args[i]);		
			}
		}
	})(arguments);

	return {
		
		
		// Enter the room with the given name through the door with the given number	
		enter: function(name, door) {
			var room = findRoomByName(name);
			if(room !== undefined) {
				room.enter(door);
			}
		},
		
		// Configure this instance.
		configure : function(configuration) {
		
			if(tools.isArray(configuration)) {
				// loop through the config and connect the loaded rooms
				configuration.forEach(function(cfg) {
									
					var name = cfg.name; // name of the current room
					
					if(tools.isArray(cfg.connections)) {
						// loop through all doors and connect them
						cfg.connections.forEach(function(con){
							var exitDoor = con.exitDoor;
							var enterDoor = con.enterDoor;
							var angle = con.angle;
							var exitR = findRoomByName(name);
							var enterR = findRoomByName(con.enterRoom);
							
							if(exitR && enterR) {
								exitR.setLeaveCallback(function (d) {			
									if(d === exitDoor) {
										enterR.enter(enterDoor, angle);
									}
								});
							}
					
						});
					}
				});
			}					
		}
	};	
});