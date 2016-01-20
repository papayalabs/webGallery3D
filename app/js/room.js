define(["engine", "three.min"], function (engine) {


	var Room = function() {
		var doors = [], 
			leaveCallback,
			preEnterCallback,
			enterCallback;
		
		var startPosition = new THREE.Vector3(0, 0, 0);
		
		this.configure = function(config) {
			if(config === undefined) {
				return; 
			}
			
			if(typeof config.onPreenter === "function") {
				preEnterCallback = config.onPreenter; 
			}
			
			if(typeof config.onEnter === "function") {
				enterCallback = config.onEnter; 
			}
			
			if(typeof config.leaving === "function") {
				leaveCallback = config.leaving; 
			}
			
			if(config.start !== undefined) {
				startPosition = config.start;
			}
			
			if(config.doors !== undefined) {
				doors = config.doors;
			}
		};
		
		this.setLeaveCallback = function (callback) {
            leaveCallback = callback;
        };
		
		
		this.enter = function (doorindex) {
            								
			if (preEnterCallback !== undefined) {
				preEnterCallback();
			}

			

            if (doorindex !== undefined && doors.length > doorindex) {
                engine.setCamera(doors[doorindex].entryPosition);
            } else {
                engine.setCamera(startPosition);
            }

            engine.addRenderCallback(function (scene, camObject, delta) {
                // This callback will be executed every frame. Check the position to see if a new room must be loaded

				if(doors === undefined) {
					return;
				}
				
				for(var i=0; i< doors.length; i++) {
					if (doors[i].isLeaving(camObject.position)) {

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
			
			if (enterCallback !== undefined) {
				enterCallback();
			}
		};
	};
	
	return {
		createRoom : function() {
			return new Room();
		},
	};

});