define(["engine", "room", "three.min"], function (engine, roomFactory) {
	
	
		var house, image1, image2,
       
		loadHouse = function () {
           
			var addToEngine = function (object) {
				engine.setShadowFlags(object, true, true);
				engine.addObject(object, undefined, true);
			};

			if (house === undefined) {
				engine.loader.load('models/room1/room1.json', function (object) {
					house = object;
					object.rotation.z = 0;
					object.rotation.y = 0;
					object.position.y = 0;
					addToEngine(object);
				}, undefined, undefined, 'models/room1');
				return false;
			} else {
				addToEngine(house);
				return true;
			}           
        },

        loadimage1 = function () {
           
			var addToEngine = function (object) {
				engine.setShadowFlags(object, true, true);
				engine.addObject(object, undefined, true);
			};

			if (image1 === undefined) {
			    engine.loader.load('models/room1/room1img1.json', function (object) {
					image1 = object;
					object.scale.multiplyScalar(0.04);
					object.position.set(200, 10, 0);
					addToEngine(object);

				}, undefined, undefined, 'models/room1');
				return false;
			} else {
				addToEngine(image1);
				return true;
			}
           
        },


        loadimage2 = function () {
            
			var addToEngine = function (object) {
				engine.setShadowFlags(object, true, true);
				engine.addObject(object, undefined, true);
			};

			if (image2 === undefined) {
			    engine.loader.load('models/room1/room1img2.json', function (object) {
					image2 = object;
					object.scale.multiplyScalar(0.12);
					object.position.set(0, 0, -200);
					addToEngine(object);

				}, undefined, undefined, 'models/room1');
				return false;
			} else {
				addToEngine(image2);
				return true;
			}           
        },

        loadLight = function () {


            var boxTarget = new THREE.Mesh(
                new THREE.BoxGeometry(0, 0, 0),
                new THREE.MeshBasicMaterial({
                    color: 0x000000
                }));

            var sphere = new THREE.Mesh(
                new THREE.SphereGeometry(50, 32, 16),
                new THREE.MeshBasicMaterial({
                    color: 0xFFFFFF
                }));

            boxTarget.position.set(0, 0, 0);
            engine.addObject(boxTarget);
            engine.addObject(sphere);


            var speed = 300;
            var wayX = 300;
            var wayZ = 300;
            var angle = 0.8;

            var xPosMin = -wayX;
            var xPosMax = wayX;
            var xPos = xPosMin;
            var zPosMin = -wayZ;
            var zPosMax = wayZ;
            var zPos = zPosMax;
            var frameCounter = 0;

            var triggerPosX = false;
            var triggerNegX = false;
            var triggerPosZ = false;
            var triggerNegZ = false;
            var d = 400;

            var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
            directionalLight1.position.set(xPos, 350, zPos);
            directionalLight1.target = boxTarget;
            directionalLight1.castShadow = true;
            //directionalLight1.shadowCameraVisible = true;
            directionalLight1.shadowDarkness = 0.7;
            directionalLight1.shadowMapWidth = 4096;
            directionalLight1.shadowMapHeight = 4096;
            directionalLight1.shadowCameraLeft = -d;
            directionalLight1.shadowCameraRight = d;
            directionalLight1.shadowCameraTop = d;
            directionalLight1.shadowCameraBottom = -d;
            directionalLight1.shadowCameraFar = 2000;

            sphere.position.set(directionalLight1.position.x, directionalLight1.position.y, directionalLight1.position.z);

            engine.addObject(directionalLight1,
                // callback which gets executed every rendered frame. Checks if the light must be moved
                function (scene, camObject, delta) {

                    frameCounter++;
                    if (camObject && (triggerPosX || triggerNegX || triggerPosZ || triggerNegZ || frameCounter % 20 === 0)) {


                        var vector = new THREE.Vector3(0, 0, -1);
                        vector.applyEuler(camObject.rotation, camObject.rotation.order);

                        if (vector.x < -angle && xPos < xPosMax && !triggerNegX) {
                            triggerPosX = true;
                        } else if (xPos >= xPosMax) {
                            triggerPosX = false;
                        }

                        if (vector.x > angle && xPos > xPosMin && !triggerPosX) {
                            triggerNegX = true;
                        } else if (xPos <= xPosMin) {
                            triggerNegX = false;
                        }

                        if (vector.z < -angle && zPos < zPosMax && !triggerNegZ) {
                            triggerPosZ = true;
                        } else if (zPos >= zPosMax) {
                            triggerPosZ = false;
                        }

                        if (vector.z > angle && zPos > zPosMin && !triggerPosZ) {
                            triggerNegZ = true;
                        } else if (zPos <= zPosMin) {
                            triggerNegZ = false;
                        }

                        if (triggerPosX) {
                            // move light to positive x
                            xPos += speed * delta;
                            directionalLight1.position.x = xPos;

                        } else if (triggerNegX) {
                            // move light to negative x
                            xPos -= speed * delta;
                            directionalLight1.position.x = xPos;
                        }

                        if (triggerPosZ) {
                            // move light to positive z
                            zPos += speed * delta;
                            directionalLight1.position.z = zPos;

                        } else if (triggerNegZ) {
                            // move light to negative z
                            zPos -= speed * delta;
                            directionalLight1.position.z = zPos;
                        }

                        sphere.position.set(directionalLight1.position.x, directionalLight1.position.y, directionalLight1.position.z);
                    }
                });

    };

	// Create a new room-instance
	var room = roomFactory.createRoom();
	
	// Configure the room
	room.configure({
	
		// Define the callback which gets executed before the room is loaded
		onPreenter : function() {
			// Set default walking-speed for this room
            engine.configureMovement();
		},
		
		// Define the callback which gets executed after the room was loaded
		onEnter : function() {
			loadLight();
			
			// Load the contents. The boolean return values are TRUE when the loader was not used.
			// The loaders are not able to skip already loaded models, so they must not be called twice for the same model.
            var isHouseCached = loadHouse();
            var isImage1Cached = loadimage1();
            var isImage2Cached = loadimage2();

            if (isHouseCached && isImage1Cached && isImage2Cached) {
			
				// Everything was already loaded, no event will be fired inside the engine, hide the blocker and start right now
                engine.hideBlockerOverride();
            }
		},
		
		// Set the start-position which is used when no door-number was provided
		start : new THREE.Vector3(0, 70, -100),
		
		// Set the array of doors.
		// Each door must have a 'entryPosition' which is used on entering the room and
		// an function 'isLeaving' which is used to check if the room should be left.
		// The return value must be an boolean.
		doors : [
			{
				entryPosition: new THREE.Vector3(90, 70, 250),
				isLeaving: function (position) {
					return position.z > 260;
				}
			}
		],
	});
	
	return room;
	
});