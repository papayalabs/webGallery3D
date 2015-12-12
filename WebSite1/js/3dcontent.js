define(["three.min", "AssimpJSONLoader", "engine"], function(a,b, engine)
{
    // Load button model using the AssimpJSONLoader
    var loader1 = new THREE.AssimpJSONLoader();
    var deg90 = Math.PI / 2;
	
  
	
	
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
            var percentComplete = xhr.loaded / xhr.total * 100;
            console.log( Math.round(percentComplete, 2) + '% downloaded' );
        }
    };

    var onError = function (xhr) {

    };
	
   
    var setShadowFlags = function (obj, cast, receive) {

        if (obj === undefined)
            return;

        obj.castShadow = cast;
        obj.receiveShadow = receive;

        if (obj.children != undefined) {
            obj.children.forEach(function (c) { setShadowFlags(c, cast, receive) });
        }
    };

	
    var loadHouse = function () {
        try {
            loader1.load('models/galleryv2.json', function (object) {


                object.rotation.x = deg90 * -1;
                object.rotation.z = 0;
                object.rotation.y = 0;
                object.position.y = -20;
               
                setShadowFlags(object, true, true);
                engine.addObject(object, undefined, true);

            }, onProgress, onError);
        }
        catch (ex)
        { }
    };

    var loadimage1 = function () {
        try {
            loader1.load('models/img1lb.json', function (object) {

                object.scale.multiplyScalar(0.04);
                object.position.set(96, -20, 0);              
                setShadowFlags(object, true, true);
                engine.addObject(object, undefined, true);

            }, onProgress, onError);
        }
        catch (ex)
        { }
    };


    var loadSkyBox = function () {
        try {
            var imagePrefix = "images/purplenebula_";
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

       
        var sphere = new THREE.Mesh(
            new THREE.SphereGeometry(2, 16, 8),
            new THREE.MeshBasicMaterial({ color: 0xffffff }));

        sphere.position.set(0, 0, 0);
        engine.addObject(sphere);

        var xPosMin = -300;
        var xPosMax = 300;
        var xPos = xPosMin;
        var zPosMin = -300;
        var zPosMax = 300;
        var zPos = zPosMin;
        var frameCounter = 0;
        
        var triggerPosX = false;
        var triggerNegX = false;
        var triggerPosZ = false;
        var triggerNegZ = false;

        var directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);       
        directionalLight1.position.set(xPos, 300, -300);
        directionalLight1.target = sphere;
        configureLight(directionalLight1);

        engine.addObject(directionalLight1,
            // callback which gets executed every rendered frame. Checks if the light must be moved
            function (scene, camObject, delta) {

                frameCounter++;
                if (camObject && (triggerPosX || triggerNegX || triggerPosZ || triggerNegZ || frameCounter % 40 == 0)) {

                    
                    var vector = new THREE.Vector3(0, 0, -1);
                    vector.applyEuler(camObject.rotation, camObject.eulerOrder);

                    if (vector.x < -0.9 && xPos < xPosMax && !triggerNegX) {
                        triggerPosX = true;                       
                    }
                    else if(xPos >= xPosMax){
                        triggerPosX = false;
                    }

                    if (vector.x > 0.9 && xPos > xPosMin && !triggerPosX) {                        
                        triggerNegX = true;
                    }
                    else if (xPos <= xPosMin) {
                        triggerNegX = false;
                    }

                    if (vector.z < -0.9 && zPos < zPosMax && !triggerNegZ) {
                        triggerPosZ = true;
                    }
                    else if (zPos >= zPosMax) {
                        triggerPosZ = false;
                    }

                    if (vector.z > 0.9 && zPos > zPosMin && !triggerPosZ) {
                        triggerNegZ = true;
                    }
                    else if (zPos <= zPosMin) {
                        triggerNegZ = false;
                    }

                    if (triggerPosX) {
                        // move light to positive x
                        xPos += 100 * delta;
                        directionalLight1.position.x = xPos;
                       
                    }
                    else if (triggerNegX) {
                        // move light to negative x
                        xPos -= 100 * delta;
                        directionalLight1.position.x = xPos;                      
                    }

                    if (triggerPosZ) {
                        // move light to positive z
                        zPos += 100 * delta;
                        directionalLight1.position.z = zPos;

                    }
                    else if (triggerNegZ) {
                        // move light to negative z
                        zPos -= 100 * delta;
                        directionalLight1.position.z = zPos;
                    }
                }
            });


      
	};

	
    var configureLight = function (directionalLight) {
        var d = 200;

        directionalLight.castShadow = true;
        directionalLight.shadowCameraVisible = true;
        directionalLight.shadowDarkness = 0.8;
        directionalLight.shadowMapWidth = 4096;
        directionalLight.shadowMapHeight = 4096;
        directionalLight.shadowCameraLeft = -d;
        directionalLight.shadowCameraRight = d;
        directionalLight.shadowCameraTop = d;
        directionalLight.shadowCameraBottom = -d;
        directionalLight.shadowCameraFar = 7000;

        
    };

	
	engine.getLock();	
	engine.init();
	
	loadSkyBox();
	loadHouse();
	loadLight();	
	loadimage1();
	
	//engine.addObject(new THREE.AxisHelper(100));
	
	engine.start();
	
				

});