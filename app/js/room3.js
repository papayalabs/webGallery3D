define(["engine", "room", "three.min"], function (engine, roomFactory) {


	var house, 
		

		loadHouse = function () {


			var addToEngine = function (object) {
				engine.setShadowFlags(object, false, false);
				engine.addObject(object, undefined, true);
			};

			if (house === undefined) {
				engine.loader.load('models/room3/galleryhighV1.json', function (object) {
					house = object;
					object.scale.multiplyScalar(1.6);
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

			var d = 300,

				boxTarget = new THREE.Mesh(
					new THREE.BoxGeometry(0, 0, 0),
					new THREE.MeshBasicMaterial({
						color: 0x000000
					})),

				sphere = new THREE.Mesh(
				   new THREE.SphereGeometry(30, 32, 16),
				   new THREE.MeshBasicMaterial({
					   color: 0xFFFFFF
				   })),

				light = new THREE.DirectionalLight(0xffffff);

			engine.addObject(boxTarget);
			engine.addObject(sphere);
			boxTarget.position.set(-400, 0, 0);
			light.position.set(-180, 400, 0);
			light.target = boxTarget;
			light.castShadow = false;
			light.shadowDarkness = 0.5;
			light.shadowCameraVisible = true; // only for debugging       
			light.shadowCameraNear = 3;
			light.shadowCameraFar = 1000;
			light.shadowMapWidth = 4096;
			light.shadowMapHeight = 4096;
			light.shadowCameraLeft = -d;
			light.shadowCameraRight = d;
			light.shadowCameraTop = d;
			light.shadowCameraBottom = -d;

			engine.addObject(light);

			sphere.position.set(light.position.x, light.position.y, light.position.z);

		};


	// Create a new room-instance
	return roomFactory.createRoom({
		
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
				entryPosition: new THREE.Vector3(0, 70, -200),
				isLeaving: function (position) {
					return position.z < -220;
				}
			},
			{
				entryPosition: new THREE.Vector3(0, 70, 200),
				isLeaving: function (position) {
					return position.z > 220;
				}
			}
		],
	});
});