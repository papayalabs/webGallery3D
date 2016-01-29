define(["engine", "three.min"], function (engine) {

	// Constructor-function which creates a room-instance
	var Room = function(configuration) {
	
		var doors = [], 
			leaveCallback,			
			speed,
			enterCallback,
			startPosition = new THREE.Vector3(0, 0, 0),
				
			loadRoom = function (doorindex) {
			
				// if the room is not empty, remove everything and execute 'loadRoom' again when all is empty
				if(!engine.isEmptyWorld()) {
					engine.removeAddedObjects(function() { loadRoom(doorindex); });
					return;
				}
				
				// Set the camera to the right position, depending on the door-number
				if (doorindex !== undefined && doors.length > doorindex) {
					engine.setCamera(doors[doorindex].entryPosition || startPosition);
				} else {
					engine.setCamera(startPosition);
				}

				// Set walking-speed for this room
				engine.configureMovement(speed);
				
				// Register the engine-callback for checking the doors
				engine.addRenderCallback(function (scene, camObject) {
					// This callback will be executed every frame. Check the position to see if a new room must be loaded

					if(doors === undefined) {
						return;
					}
					
					var i,
					leave = function() {					
						// fire the leave-requirest-callback with the index of the door
						leaveCallback(i);						
					};
					
					for(i=0; i< doors.length; i++) {
						if (doors[i].isLeaving !== undefined && doors[i].isLeaving(camObject.position)) {

							if (leaveCallback !== undefined) {

								// delete all objects and callbacks in the scene execpt the skybox
								// and execute the callback when ready
								engine.removeAddedObjects(leave);
															
								break;
							}
						}
					}							
				});
				
				// Execute the enter-callback.
				// Content and more engine-callbacks will be added here.
				// The return value of the callback defines wether the content was completely loaded from the cache or not
				if (enterCallback !== undefined) {
					if(enterCallback()) {
					
						// Everything was already loaded, no event will be fired inside the engine, hide the blocker and start right now
						engine.hideBlockerOverride();
					}
					
				}
			};
	
		// Method 'configure': configures the new instance by a given configuration-object
		(function(config) {
			if(config === undefined) {
				return; 
			}
								
			// The 'config.onEnter'-callback gets executed after a new room was entered.
			// Load the room-content in this callback
			if(typeof config.onEnter === "function") {
				enterCallback = config.onEnter; 
			}
			
			// The 'config.leaving'-callback gets executed when a room is left.
			// The first parameter on the callback is the number of the door through which the room was left.
			if(typeof config.leaving === "function") {
				leaveCallback = config.leaving; 
			}
			
			// 'config.start' contains a THREE-Vector-instance with the start position which is used when no door-number was given
			if(config.start instanceof THREE.Vector3) {
				startPosition = config.start;
			}
			
			speed = config.speed;
			
			// sets the array of door objects.
			if(config.doors !== undefined) {
				doors = config.doors;
			}
			
		})(configuration);
		
		// Method 'setLeaveCallback': set the callback which gets executed when a room is left.
		// The first parameter on the callback is the number of the door through which the room was left.
		this.setLeaveCallback = function (callback) {
			leaveCallback = callback;
		};
		
		// Method 'enter': loads the room with the given number
		this.enter = loadRoom;		
	};
	
	return {
	
		// Return a singleton factory-method to create new instances
		createRoom : function(configuration) {
			return new Room(configuration);
		},
	};

});