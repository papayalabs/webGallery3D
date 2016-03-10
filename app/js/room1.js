define(["engine", "room", "three"], function (engine, roomFactory, THREE) {
	
	
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
		

			var speed = 300,
				wayX = 300,
				wayZ = 300,
				angle = 0.8,
				frameCounter = 0,
				triggerPosX = false,
				triggerNegX = false,
				triggerPosZ = false,
				triggerNegZ = false,
				d = 400;

			var xPosMin = -wayX,
				xPosMax = wayX,
				xPos = xPosMin,
				zPosMin = -wayZ,
				zPosMax = wayZ,
				zPos = zPosMax,
					  
				sphere = new THREE.Mesh(
					new THREE.SphereGeometry(50, 32, 16),
					new THREE.MeshBasicMaterial({
						color: 0xFFFFFF
					}));
								
			engine.addObject(sphere);

			var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1.5);
			directionalLight1.position.set(xPos, 350, zPos);			
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
	return roomFactory.createRoom({
		
		// Name of the room
		name: "Room1",

		// The index of the skybox: Load 'Space'
		sky: 0,
			
		// Define the callback which gets executed after the room was loaded
		onEnter : function() {
			loadLight();
			
			// Load the contents. The boolean return values are TRUE when the loader was not used.
			// The loaders are not able to skip already loaded models, so they must not be called twice for the same model.
			var isHouseCached = loadHouse();
			var isImage1Cached = loadimage1();
			var isImage2Cached = loadimage2();

			return isHouseCached && isImage1Cached && isImage2Cached;									
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


		labels: [
			{
				position: {	x: 0, y: 20, z: -200 },
				rotation : 0,
				text: {
					'de': 'America\'s Cupper||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'America\'s Cupper||2015, Acrylic on canvas|Holger Pfaff'
				}
			},
			{
				position: { x: 170, y: 140, z: -98 },
				rotation: 270,
				text: {
					'de': 'Winter 1||2012, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Winter 1||2012, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: 170, y: 140, z: -12 },
				rotation: 270,
				text: {
					'de': 'Stadt an der Sonne||2013, Acryl auf Leinwand|Holger Pfaff',
					'en': 'City near the Sun||2013, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: 170, y: 140, z: 78 },
				rotation: 270,
				text: {
					'de': 'Regenwald||2014, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Rainforest||2014, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: -220, y: 70, z: -90 },
				 rotation: 90,
				 text: {
					 'de': 'Felsen und Brandung||2015, Acryl auf Leinwand|Holger Pfaff',
					 'en': 'Rock and Surf||2015, Acrylic on canvas|Holger Pfaff'
				 }
			 },
		],
	});
	
	
});