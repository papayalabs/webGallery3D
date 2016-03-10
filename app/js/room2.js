define(["engine", "room", "three"], function (engine, roomFactory, THREE) {

   
	var house, image1, 
		deg90 = Math.PI / 2,


		loadHouse = function () {	   	  
			var addToEngine = function (object) {                
				engine.setShadowFlags(object, true, true);
				engine.addObject(object, undefined, true);               
			};

			if (house === undefined) {
				engine.loader.load('models/room2/room2.json', function (object) {
					house = object;                    
					object.rotation.z = 0;
					object.rotation.y = 0;
					object.position.y = 0;
					addToEngine(object);
				}, undefined, undefined, 'models/room2');
				return false;
			}
			else {
				addToEngine(house);
				return true;
			}
		   
		},


		loadimage1 = function () {
		   
			var addToEngine = function (object) {
				engine.setShadowFlags(object, true, true);
				engine.addObject(object,
					function (scene, camObject, delta) {

						if (camObject) {

							var dist = camObject.position.distanceTo(object.position);
						
							// rotate the cube if the camera is far away
							if (dist > 250) {                                
								object.rotation.z += deg90 * 0.2 * delta;
							}
						}
						
					}, true);
			};

			if (image1 === undefined) {
				engine.loader.load('models/room2/room2box.json', function (object) {
					image1 = object;
					object.scale.multiplyScalar(0.7);
					object.position.set(0, 30, 400);
					addToEngine(object);

				}, undefined, undefined, 'models/room2');
				return false;
			} else {
				addToEngine(image1);
				return true;
			}       
		},

  
		loadLight = function () {

			var d = 600,
							
				sphere = new THREE.Mesh(
				   new THREE.SphereGeometry(30, 32, 16),
				   new THREE.MeshBasicMaterial({
					   color: 0xFFFFFF
				   })),
				   
				light = new THREE.DirectionalLight(0xffffff);

			
			engine.addObject(sphere);
			light.target.position.set(0,0,100);					
			light.position.set(0, 420, -250);			
			light.castShadow = true;
			light.shadowDarkness = 0.5;
			//light.shadowCameraVisible = true; // only for debugging       
			light.shadowCameraNear = 3;
			light.shadowCameraFar = 2000;     
			light.shadowMapWidth = 4096;
			light.shadowMapHeight = 4096;
			light.shadowCameraLeft = -d;
			light.shadowCameraRight = d;
			light.shadowCameraTop = 800;
			light.shadowCameraBottom = -d;

			engine.addObject(light);
			engine.addObject(light.target);

			sphere.position.set(light.position.x, light.position.y, light.position.z);
			  
		};

	
	// Create a new room-instance
	return roomFactory.createRoom({
			
		speed : 700,
		sky: 0,
		name : "Room2",	
		
		// Define the callback which gets executed after the room was loaded
		onEnter : function() {
			
			loadLight();
			
			// Load the contents. The boolean return values are TRUE when the loader was not used.
			// The loaders are not able to skip already loaded models, so they must not be called twice for the same model.
			var isHouseCached = loadHouse();
			var isImage1Cached = loadimage1();
				   
			return isHouseCached && isImage1Cached;			
		},
		
		// Set the start-position which is used when no door-number was provided
		start : new THREE.Vector3(0, 70, 0),
		
		// Set the array of doors.
		// Each door must have a 'entryPosition' which is used on entering the room and
		// an function 'isLeaving' which is used to check if the room should be left.
		// The return value must be an boolean.
		doors : [
			{
				entryPosition: new THREE.Vector3(0, 70, -250),
				isLeaving: function (position) {
					return position.z < -340;
				}
			},
			{
				entryPosition: new THREE.Vector3(170, 70, -110),
				isLeaving: function (position) {
					return position.x > 184 && position.z > -143 && position.z < -84;
				}
			}
		],

		labels: [
			{
				position: {	x: 338, y: 10, z: 685 },
				rotation : 205,
				text: {
					'de': 'Rinde||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Bark||2015, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: 125, y: 10, z: 850 },
				rotation: 180,
				text: {
					'de': 'Wiedersehen||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Reunion||2015, Acrylic on canvas|Holger Pfaff'
				}
			},


			{
				position: { x: 0, y: 10, z: 850 },
				rotation: 180,
				text: {
					'de': 'Kassiopeia||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'Kassiopeia||2015, Acrylic on canvas|Holger Pfaff'
				}
			},

			{
				position: { x: -128, y: 10, z: 850 },
				rotation: 180,
				text: {
					'de': 'Fernsehabend||2015, Acryl auf Leinwand|Holger Pfaff',
					'en': 'TV evening||2015, Acrylic on canvas|Holger Pfaff'
				}
			},

			 {
				 position: { x: -405, y: 70, z: 660 },
				 rotation: 159,
				 text: {
					 'de': 'Abend||2012, Acryl auf Leinwand|Holger Pfaff',
					 'en': 'Dawn||2012, Acrylic on canvas|Holger Pfaff'
				 }
			 },


		],
	});
	
	
	
});