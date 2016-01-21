define(["engine", "three.min"], function (engine) {

	// Constructor-function which creates a room-instance
	var Room = function() {
	
		var doors = [], 
			leaveCallback,
			preEnterCallback,
			enterCallback;
		
		var startPosition = new THREE.Vector3(0, 0, 0);
	
		// Method 'configure': configures the new instance by a given configuration-object
		this.configure = function(config) {
			if(config === undefined) {
				return; 
			}
			
			// The 'config.onPreenter'-callback gets executed before a new room is entered
			if(typeof config.onPreenter === "function") {
				preEnterCallback = config.onPreenter; 
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
			if(config.start !== undefined) {
				startPosition = config.start;
			}
			
			// sets the array of door objects.
			if(config.doors !== undefined) {
				doors = config.doors;
			}
		};
		
		// Method 'setLeaveCallback': set the callback which gets executed when a room is left.
		// The first parameter on the callback is the number of the door through which the room was left.
		this.setLeaveCallback = function (callback) {
            leaveCallback = callback;
        };
		
		// Method 'enter': loads the room with the given number
		this.enter = function (doorindex) {

			// Execute the preenter-callback
			if (preEnterCallback !== undefined) {
				preEnterCallback();
			}
			
			// Set the camera to the right position, depending on the door-number
            if (doorindex !== undefined && doors.length > doorindex) {
                engine.setCamera(doors[doorindex].entryPosition);
            } else {
                engine.setCamera(startPosition);
            }

			// Register the engine-callback for checking the doors
            engine.addRenderCallback(function (scene, camObject) {
                // This callback will be executed every frame. Check the position to see if a new room must be loaded

				if(doors === undefined) {
					return;
				}
				
				for(var i=0; i< doors.length; i++) {
					if (doors[i].isLeaving !== undefined && doors[i].isLeaving(camObject.position)) {

						if (leaveCallback !== undefined) {

							// delete all objects and callbacks in the scene execpt the skybox
							engine.removeAddedObjects();

							// fire the leave-requirest-callback with the index of the door
							leaveCallback(i);
							
							break;
						}
					}
				}							
            });
			
			// Execute the preenter-callback.
			// Content and more engine-callbacks will be added here.
			if (enterCallback !== undefined) {
				enterCallback();
			}
		};
	};
	
	return {
	
		// Return a singleton factory-method to create new instances
		createRoom : function() {
			return new Room();
		},
	};

});