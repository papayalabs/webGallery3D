define(["engine", "room", "three"], function (engine, roomFactory, THREE) {


	var house, 
		

		loadHouse = function () {


			var addToEngine = function (object) {
				engine.setShadowFlags(object, false, false);
				engine.addObject(object, undefined, true);
			};

			if (house === undefined) {
				engine.loader.load('models/room3/room3.json', function (object) {
					house = object;
					object.scale.multiplyScalar(0.3);
					object.rotation.z = 0;
					object.rotation.y = 0;
					object.position.y = 0;
					addToEngine(object);
				}, undefined, undefined, 'models/room3');
				return false;
			}
			else {
				addToEngine(house);
				return true;
			}

		},


		
		loadLight = function () {

			var light1 = new THREE.SpotLight(0xffffff);
			var light2 = new THREE.SpotLight(0xffffff);
		
			light1.target.position.set(0, 70, -140);
			light1.position.set(0, 200, 0);

			light2.target.position.set(0, 70, 140);
			light2.position.set(0, 200, 50);
						
			engine.addObject(light1.target);
			engine.addObject(light1);

			engine.addObject(light2.target);
			engine.addObject(light2);
		};


	// Create a new room-instance
	return roomFactory.createRoom({
		
		// The name of the room
		name: "Room3",

		// Load no skybox
		sky: -1,
		
		// Define the callback which gets executed after the room was loaded
		onEnter: function () {

			loadLight();

			// Load the contents. The boolean return values are TRUE when the loader was not used.
			// The loaders are not able to skip already loaded models, so they must not be called twice for the same model.
			var isHouseCached = loadHouse();
		   

			return isHouseCached;
				
		},

		// Set the start-position which is used when no door-number was provided
		start: new THREE.Vector3(0, 70, 0),

		// Set the array of doors.
		// Each door must have a 'entryPosition' which is used on entering the room and
		// an function 'isLeaving' which is used to check if the room should be left.
		// The return value must be an boolean.
		doors: [
			{
				entryPosition: new THREE.Vector3(0, 70, 150),
				isLeaving: function (position) {
					return position.z > 160;
				}
			}
		],

		labels: [
			{
				position: {	x: 0, y: 15, z: -160 },
				rotation : 0,
				text: {
					'de': 'Steinherz||2016, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Heart of Stone||2016, Acrylic on canvas|Holger Pfaff'
				}
			},
		],
	});
});