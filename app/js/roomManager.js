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
									
					// name of the current room
				    var exitR = findRoomByName(cfg.name);

				    exitR.setLeaveCallback(function (d) {
				       
				        if (tools.isArray(cfg.connections)) {

				            // loop through all doors and connect them
				            cfg.connections.forEach(function (con) {
				                if (con.exitDoor === d) {				                   				                   
				                    var enterR = findRoomByName(con.enterRoom);
				                    if (enterR !== undefined) {
				                        enterR.enter(con.enterDoor, con.angle);
				                    }
				                }
				            });
				        }
				    });

					
				});
			}					
		}
	};	
});