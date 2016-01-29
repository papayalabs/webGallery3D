define([], function () {

	var rooms = [],
	
	// Finds the room with the given name in the local array and returns it
	// If the room cannot be found, this returns 'undefined'
	findRoomByName = function(name) {
		for(var i=0; i< rooms.length; i++) {			
			if(rooms[i].roomName === name) {
				return rooms[i];
			}			
		}
		return undefined;
	},
	
	// Gets the room with the given name.
	// If the room is not in the local array, it will be loaded with require.js
	getRoom = function(name, resultCallback) {
		var a = findRoomByName(name);
		if(a) {
			resultCallback(a);
		} else {
			require([name], function(ra) {
				rooms.push(ra);
				ra.roomName = name;
				resultCallback(ra);
			});
		}
	},
	
	// Load all rooms from the given config and fire a callback when done.
	loadAllRooms = function(configuration, allLoadedCallback) {
		var cnt = 0;
		configuration.forEach(function(cfg) {
			var name = cfg.name;
			getRoom(name, function(room) {
				if(room !== undefined) {
					cnt++;
					if(cnt === configuration.length) {
						allLoadedCallback();
					}
				}
			});
		});
	};
	
	
	

	return {
		
		
		// Enter the room with the given name through the door with the given number
		enter: function(name, door) {
			getRoom(name, function(room){
				room.enter(door);
			});
		},
		
		// Configure this instance and fire the callback when ready.
		configure : function(configuration, callback) {
		
			// Load all rooms with reqiure
			loadAllRooms(configuration, function() {
			
				// loop through the config and connect the loaded rooms
				configuration.forEach(function(cfg) {
									
					var name = cfg.name; // name of the current room
					
					// loop through all doors and connect them
					cfg.connections.forEach(function(con){
						var exitDoor = con.exitDoor;
						var enterDoor = con.enterDoor;
						var enterRoom = con.enterRoom;
						
						var exitR = findRoomByName(name);
						var enterR = findRoomByName(enterRoom);
						exitR.setLeaveCallback(function (d) {			
							if(d === exitDoor) {
								enterR.enter(enterDoor);
							}
						});
				
					});
				});
				
				if(typeof callback === 'function') {
					callback();
				}
			});
		
			
		}
	};	
});