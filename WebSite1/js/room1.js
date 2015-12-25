define(["three.min", "AssimpJSONLoader", "engine"], function(a,b, engine)
{
    var manager = new THREE.LoadingManager();
    var loader1 = new THREE.AssimpJSONLoader(manager);
    var deg90 = Math.PI / 2;


	manager.onProgress = function (item, loaded, total) {
	    var percentComplete = loaded / total * 100;
	    var msg = Math.round(percentComplete, 2) + '% heruntergeladen';
	    engine.setLoadMessage(msg);	    		
	};

	manager.onLoad = function () {	    
	    engine.getLock();
	    engine.start();
	};

	manager.onError = function () {
		console.log('there has been an error');
	};

	
  	
   
	
	
	var loadHouse = function () {
		try {
			loader1.load('models/room1/galleryBox.json', function (object) {


				object.rotation.x = deg90 * -1;
				object.rotation.z = 0;
				object.rotation.y = 0;
				object.position.y = 0;
			   
				engine.setShadowFlags(object, false, true);
				engine.addObject(object, undefined, true);

			}, undefined, undefined, 'images');
		}
		catch (ex)
		{ }
	};

	var loadimage1 = function () {
		try {
		    loader1.load('models/room1/image1l.json', function (object) {
			    object.rotation.z = deg90 * 0.2;			    
				object.scale.multiplyScalar(0.04);
				object.position.set(250, 10, -170);              
				engine.setShadowFlags(object, true, true);
				engine.addObject(object, undefined, true);

			}, undefined, undefined, 'images');
		}
		catch (ex)
		{ }
	};


	var loadimage2 = function () {
	    try {
	        loader1.load('models/room1/image2.json', function (object) {

	            object.scale.multiplyScalar(0.12);
	            object.position.set(0, 0, -300);
	            engine.setShadowFlags(object, true, true);
	            engine.addObject(object, undefined, true);

	        }, undefined, undefined, 'images');
	    }
	    catch (ex)
	    { }
	};

   

	var loadSkyBox = function () {
		try {
			var imagePrefix = "images/skybox/purplenebula_";
			//var directions = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
			var directions = ["ft", "bk", "up", "dn", "rt", "lf"];
			var imageSuffix = ".png";
			var skyGeometry = new THREE.CubeGeometry(5000, 5000, 5000);

			var materialArray = [];
			for (var i = 0; i < 6; i++)
				materialArray.push(new THREE.MeshBasicMaterial({
					map: THREE.ImageUtils.loadTexture(imagePrefix + directions[i] + imageSuffix),
					side: THREE.BackSide
				}));
			var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
			var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

			engine.addObject(skyBox,
				// callback which gets executed every rendered frame. Moves the skybox with the camera
				function (scene, camObject, delta) {
					if (camObject) {
						var pos = camObject.position;
						skyBox.position.set(pos.x, pos.y, pos.z);
					}
				});

		}
		catch (ex)
		{ }
	};
	
	var loadLight = function () {

	   
		var boxTarget = new THREE.Mesh(
			new THREE.BoxGeometry( 0, 0, 0 ),
			new THREE.MeshBasicMaterial({ color: 0x000000 }));

		var sphere = new THREE.Mesh(
			new THREE.SphereGeometry(50, 32, 16),
			new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));

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

		var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);       
		directionalLight1.position.set(xPos, 250, zPos);
		directionalLight1.target = boxTarget;		
		directionalLight1.castShadow = true;
	    //directionalLight.shadowCameraVisible = true;
		directionalLight1.shadowDarkness = 0.7;
		directionalLight1.shadowMapWidth = 4096;
		directionalLight1.shadowMapHeight = 4096;
		directionalLight1.shadowCameraLeft = -d;
		directionalLight1.shadowCameraRight = d;
		directionalLight1.shadowCameraTop = d;
		directionalLight1.shadowCameraBottom = -d;
		directionalLight1.shadowCameraFar = 7000;

		engine.addObject(directionalLight1,
			// callback which gets executed every rendered frame. Checks if the light must be moved
			function (scene, camObject, delta) {

				frameCounter++;
				if (camObject && (triggerPosX || triggerNegX || triggerPosZ || triggerNegZ || frameCounter % 20 == 0)) {

					
					var vector = new THREE.Vector3(0, 0, -1);
					vector.applyEuler(camObject.rotation, camObject.rotation.order);

					if (vector.x < -angle && xPos < xPosMax && !triggerNegX) {
						triggerPosX = true;                       
					}
					else if(xPos >= xPosMax){
						triggerPosX = false;
					}

					if (vector.x > angle && xPos > xPosMin && !triggerPosX) {
						triggerNegX = true;
					}
					else if (xPos <= xPosMin) {
						triggerNegX = false;
					}

					if (vector.z < -angle && zPos < zPosMax && !triggerNegZ) {
						triggerPosZ = true;
					}
					else if (zPos >= zPosMax) {
						triggerPosZ = false;
					}

					if (vector.z > angle && zPos > zPosMin && !triggerPosZ) {
						triggerNegZ = true;
					}
					else if (zPos <= zPosMin) {
						triggerNegZ = false;
					}

					if (triggerPosX) {
						// move light to positive x
						xPos += speed * delta;
						directionalLight1.position.x = xPos;
					   
					}
					else if (triggerNegX) {
						// move light to negative x
						xPos -= speed * delta;
						directionalLight1.position.x = xPos;                      
					}

					if (triggerPosZ) {
						// move light to positive z
						zPos += speed * delta;
						directionalLight1.position.z = zPos;

					}
					else if (triggerNegZ) {
						// move light to negative z
						zPos -= speed * delta;
						directionalLight1.position.z = zPos;
					}

					sphere.position.set(directionalLight1.position.x,directionalLight1.position.y,directionalLight1.position.z );
				}
			});


	  
	};

	
	
		
	engine.init();	
	loadSkyBox();
	loadHouse();
	loadLight();	
	loadimage1();
	loadimage2();
});